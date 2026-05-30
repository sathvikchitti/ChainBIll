import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const _session = await getServerSession(authOptions)
    const userEmail = _session?.user?.email
    if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { invoiceId, disputeText } = await req.json()

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*, audit_trail(*)')
      .eq('id', invoiceId)
      .maybeSingle()

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

    const apiKey = process.env.GEMINI_API_KEY
    let result: any

    if (apiKey) {
      try {
        const prompt = `Summarize the following invoice dispute.
Invoice: ${JSON.stringify({ amount: invoice.amount, status: invoice.status, invoiceNo: invoice.invoice_no })}
Dispute reason: ${disputeText}
Respond ONLY with valid JSON (no markdown): {
  "historySummary": "string",
  "disputeReason": "string",
  "resolutionNote": "string"
}`
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          }
        )
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
        result = JSON.parse(text.replace(/```json|```/g, '').trim())
      } catch (e) {
        console.warn('[summarize-dispute] Gemini failed')
      }
    }

    if (!result) {
      result = {
        historySummary: `Invoice ${invoice.invoice_no} for ₹${invoice.amount} is currently in ${invoice.status} status.`,
        disputeReason: disputeText,
        resolutionNote:
          'Recommend escalation to compliance team for manual review within 5 business days.',
      }
    }

    const { data: dbUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle()

    await supabase.from('ai_analyses').insert({
      type: 'DISPUTE',
      result,
      confidence_score: 95,
      explanation: result.resolutionNote,
      invoice_id: invoiceId,
      user_id: dbUser?.id ?? null,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[summarize-dispute]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
