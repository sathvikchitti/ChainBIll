import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabase'
import { writeAuditEntry } from '@/lib/auditTrail'
import { createHash } from 'crypto'

function generateBlockchainHash(data: string): string {
  return '0x' + createHash('sha256').update(data + Date.now()).digest('hex')
}

function generateImmutableId(invoiceNo: string): string {
  const hash = createHash('sha256').update(invoiceNo + Date.now()).digest('hex')
  return `CB-${hash.slice(0, 8).toUpperCase()}`
}

// ── GET /api/invoices ─────────────────────────────────────────────────────────
export async function GET(request: Request) {
  try {
    const _session = await getServerSession(authOptions)
    const userEmail = _session?.user?.email
    if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single()

    if (userErr || !dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status')

    let query = supabase
      .from('invoices')
      .select(`
        *,
        supplier:supplier_id ( id, name, email, supplier_profiles(company_name) ),
        buyer:buyer_id       ( id, name, email, buyer_profiles(company_name, credit_score) ),
        funding_transactions ( * )
      `)
      .order('created_at', { ascending: false })

    if (dbUser.role === 'SUPPLIER') {
      query = query.eq('supplier_id', dbUser.id)
    } else if (dbUser.role === 'BUYER') {
      query = query.eq('buyer_id', dbUser.id)
    } else if (dbUser.role === 'INVESTOR') {
      query = query.in('status', ['listed', 'funded', 'settled'])
    }

    if (statusFilter) query = query.eq('status', statusFilter)

    const { data: invoices, error } = await query
    if (error) throw error

    return NextResponse.json(invoices ?? [])
  } catch (err: any) {
    console.error('[GET /api/invoices]', err)
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}

// ── POST /api/invoices ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const _session = await getServerSession(authOptions)
    const userEmail = _session?.user?.email
    if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single()

    if (userErr || !dbUser || dbUser.role !== 'SUPPLIER') {
      return NextResponse.json({ error: 'Only suppliers can create invoices' }, { status: 403 })
    }

    const data = await request.json()

    // Prevent duplicate invoice numbers
    const { data: existing } = await supabase
      .from('invoices')
      .select('id')
      .eq('invoice_no', data.invoiceNo)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Invoice number already exists' }, { status: 409 })
    }

    const isDraft = data.isDraft === true
    const blockchainHash = generateBlockchainHash(`CREATED:${data.invoiceNo}:${dbUser.id}`)
    const immutableId = generateImmutableId(data.invoiceNo)

    const { data: invoice, error: insertErr } = await supabase
      .from('invoices')
      .insert({
        invoice_no: data.invoiceNo,
        immutable_id: immutableId,
        supplier_id: dbUser.id,
        buyer_id: data.buyerId,
        supplier_name: data.supplierName ?? null,
        buyer_name: data.buyerName ?? null,
        amount: parseFloat(data.amount),
        description: data.description ?? '',
        due_date: new Date(data.dueDate).toISOString(),
        is_draft: isDraft,
        status: isDraft ? 'draft' : 'pending',
        blockchain_tx_hash: blockchainHash,
        gst_no: data.gstNo ?? null,
        payment_terms: data.paymentTerms ?? null,
        pdf_url: data.pdfUrl ?? null,
      })
      .select()
      .single()

    if (insertErr || !invoice) {
      console.error('[POST /api/invoices] insert:', insertErr)
      throw insertErr
    }

    // Audit trail
    await writeAuditEntry({
      invoiceId: invoice.id,
      action: isDraft ? 'DRAFT_SAVED' : 'CREATED',
      actorId: dbUser.id,
      txHash: blockchainHash,
      metadata: { amount: invoice.amount, invoiceNo: invoice.invoice_no },
    })

    // Credit ledger entry
    await supabase.from('credit_ledger').insert({
      supplier_id: dbUser.id,
      invoice_id: invoice.id,
      event_type: 'invoice_raised',
      blockchain_tx_hash: blockchainHash,
    })

    return NextResponse.json(invoice)
  } catch (err: any) {
    console.error('[POST /api/invoices]', err)
    return NextResponse.json({ error: err.message ?? 'Failed to create invoice' }, { status: 500 })
  }
}
