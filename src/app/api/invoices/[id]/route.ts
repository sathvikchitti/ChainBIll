import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabase } from '@/lib/supabase'
import { writeAuditEntry } from '@/lib/auditTrail'
import { createHash } from 'crypto'
import {
  createInvoiceOnChain,
  confirmInvoiceOnChain,
  fundInvoiceOnChain,
} from '@/lib/contract'

function generateBlockchainHash(data: string): string {
  return '0x' + createHash('sha256').update(data + Date.now()).digest('hex')
}

function generateImmutableId(invoiceNo: string): string {
  const hash = createHash('sha256').update(invoiceNo + Date.now()).digest('hex')
  return `CB-${hash.slice(0, 8).toUpperCase()}`
}

type RouteProps = { params: Promise<{ id: string }> }

// ── GET /api/invoices/[id] ─────────────────────────────────────────────────
export async function GET(_req: Request, props: RouteProps) {
  try {
    const { id } = await props.params

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        supplier:supplier_id ( id, name, email, supplier_profiles(company_name) ),
        buyer:buyer_id       ( id, name, email, buyer_profiles(company_name, credit_score) ),
        funding_transactions ( *, investor:investor_id( id, name, investor_profiles(company_name) ) ),
        audit_trail          ( * ),
        settlement_records   ( * )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return NextResponse.json(invoice)
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 })
  }
}

// ── PATCH /api/invoices/[id] ───────────────────────────────────────────────
export async function PATCH(request: Request, props: RouteProps) {
  try {
    const _session = await getServerSession(authOptions)
    const userEmail = _session?.user?.email
    const { id } = await props.params
    const body = await request.json()

    // Resolve acting user
    let actorDbId: string | undefined
    if (userEmail) {
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single()
      actorDbId = u?.id
    }

    // Fetch current invoice
    const { data: inv, error: fetchErr } = await supabase
      .from('invoices')
      .select('*, funding_transactions(*)')
      .eq('id', id)
      .single()

    if (fetchErr || !inv) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    const { status, investorId, ...rest } = body

    // Copy scalar field overrides (e.g. discount_rate)
    Object.assign(updateData, rest)

    // ── Status transition logic ──────────────────────────────────────────────

    if (status === 'verified') {
      const { hash } = await confirmInvoiceOnChain(id)
      updateData.status = 'verified'
      updateData.blockchain_tx_hash = hash
      updateData.verified_at = new Date().toISOString()
    }

    if (status === 'listed') {
      if (!inv.immutable_id) {
        updateData.immutable_id = generateImmutableId(inv.invoice_no)
      }
      const { hash } = await createInvoiceOnChain(id, '', inv.amount, new Date(inv.due_date).getTime() / 1000)
      updateData.status = 'listed'
      updateData.blockchain_tx_hash = hash
    }

    if (status === 'funded') {
      const { hash } = await fundInvoiceOnChain(id)
      updateData.status = 'funded'
      updateData.funding_progress = 100
      updateData.blockchain_tx_hash = hash

      // Resolve investor DB id
      let investorDbId = investorId
      if (userEmail && !investorId) {
        investorDbId = actorDbId
      } else if (investorId) {
        // investorId may be a Clerk ID — resolve it
        const { data: invUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', investorId)
          .maybeSingle()
        investorDbId = invUser?.id ?? investorId
      }

      if (investorDbId) {
        await supabase.from('funding_transactions').insert({
          invoice_id: id,
          investor_id: investorDbId,
          amount_funded: inv.amount,
          settlement_tx_hash: hash,
        })

        // Increment investor total_funded
        const { data: profile } = await supabase
          .from('investor_profiles')
          .select('total_funded')
          .eq('user_id', investorDbId)
          .maybeSingle()

        if (profile) {
          await supabase
            .from('investor_profiles')
            .update({ total_funded: (profile.total_funded ?? 0) + inv.amount })
            .eq('user_id', investorDbId)
        }

        // Credit ledger
        await supabase.from('credit_ledger').insert({
          supplier_id: inv.supplier_id,
          invoice_id: id,
          event_type: 'funded',
          blockchain_tx_hash: hash,
        })
      }
    }

    if (status === 'settled') {
      const settleTx = generateBlockchainHash(`SETTLED:${id}`)
      updateData.status = 'settled'
      updateData.settlement_status = 'SETTLED'
      updateData.settled_at = new Date().toISOString()

      const fundingTxns: any[] = inv.funding_transactions ?? []
      if (fundingTxns.length > 0) {
        const ft = fundingTxns[0]
        const ROI = 5.2
        const returnAmount = ft.amount_funded * (1 + ROI / 100)

        await supabase
          .from('settlement_records')
          .upsert(
            {
              invoice_id: id,
              investor_id: ft.investor_id,
              principal_amount: ft.amount_funded,
              return_amount: returnAmount,
              roi: ROI,
            },
            { onConflict: 'invoice_id' }
          )

        await supabase.from('credit_ledger').insert({
          supplier_id: inv.supplier_id,
          invoice_id: id,
          event_type: 'settled',
          blockchain_tx_hash: settleTx,
        })
      }
    }

    if (status === 'disputed') {
      updateData.status = 'disputed'
    }

    if (status === 'buyer_confirmed') {
      updateData.status = 'verified'
      updateData.verified_at = new Date().toISOString()
      const hash = generateBlockchainHash(`BUYER_CONFIRMED:${id}`)
      updateData.blockchain_tx_hash = hash

      await supabase.from('credit_ledger').insert({
        supplier_id: inv.supplier_id,
        invoice_id: id,
        event_type: 'buyer_confirmed',
        blockchain_tx_hash: hash,
      })
    }

    // Apply update
    const { data: updated, error: updateErr } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateErr) throw updateErr

    // Audit trail for status changes
    const auditableStatuses = ['verified', 'listed', 'funded', 'settled', 'disputed', 'buyer_confirmed']
    if (status && auditableStatuses.includes(status)) {
      const txHash = (updateData.blockchain_tx_hash as string) ?? generateBlockchainHash(`${status}:${id}`)
      await writeAuditEntry({
        invoiceId: id,
        action: status === 'buyer_confirmed' ? 'VERIFIED' : status.toUpperCase() as any,
        actorId: actorDbId,
        txHash,
        metadata: { amount: inv.amount },
      })
    }

    return NextResponse.json(updated)
  } catch (err: any) {
    console.error('[PATCH /api/invoices/[id]]', err)
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}
