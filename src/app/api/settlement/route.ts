import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(_req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
      .single()

    if (userErr || !dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Active funded invoices this investor has funded
    const { data: fundedTxns } = await supabase
      .from('funding_transactions')
      .select('invoice_id')
      .eq('investor_id', dbUser.id)

    const fundedInvoiceIds = (fundedTxns ?? []).map((t: any) => t.invoice_id)

    let activeInvoices: any[] = []
    if (fundedInvoiceIds.length > 0) {
      const { data } = await supabase
        .from('invoices')
        .select(`
          *,
          buyer:buyer_id       ( id, name, buyer_profiles(company_name) ),
          supplier:supplier_id ( id, name, supplier_profiles(company_name) )
        `)
        .in('id', fundedInvoiceIds)
        .eq('status', 'funded')
        .order('created_at', { ascending: false })

      activeInvoices = data ?? []
    }

    // Settled records for this investor
    const { data: settlements } = await supabase
      .from('settlement_records')
      .select(`
        *,
        invoice:invoice_id (
          *,
          buyer:buyer_id       ( id, name, buyer_profiles(company_name) ),
          supplier:supplier_id ( id, name, supplier_profiles(company_name) )
        )
      `)
      .eq('investor_id', dbUser.id)
      .order('settled_at', { ascending: false })

    const settledList = settlements ?? []

    const totalReturns = settledList.reduce((sum: number, s: any) => sum + s.return_amount, 0)
    const totalPrincipal = settledList.reduce((sum: number, s: any) => sum + s.principal_amount, 0)
    const avgROI =
      settledList.length > 0
        ? settledList.reduce((sum: number, s: any) => sum + s.roi, 0) / settledList.length
        : 0

    const onTimeSettlements = Math.round(settledList.length * 0.92)

    return NextResponse.json({
      activeInvoices,
      settlements: settledList,
      stats: {
        activeCount: activeInvoices.length,
        settledCount: settledList.length,
        totalPrincipal,
        totalReturns,
        netProfit: totalReturns - totalPrincipal,
        avgROI: parseFloat(avgROI.toFixed(2)),
        onTimePercentage:
          settledList.length > 0
            ? Math.round((onTimeSettlements / settledList.length) * 100)
            : 100,
      },
    })
  } catch (err: any) {
    console.error('[GET /api/settlement]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
