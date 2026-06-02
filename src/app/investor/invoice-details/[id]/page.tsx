'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import BorderGlow from '@/components/BorderGlow'

interface Invoice {
  id: string
  invoice_no: string
  immutable_id: string | null
  amount: number
  status: string
  discount_rate: number | null
  due_date: string
  description: string
  gst_no: string | null
  payment_terms: string | null
  pdf_url: string | null
  blockchain_tx_hash: string | null
  verified_at: string | null
  supplier: { name: string; supplier_profiles: { company_name: string } | null } | null
  buyer: { name: string; buyer_profiles: { company_name: string; credit_score: number } | null } | null
  funding_transactions: any[]
  audit_trail: any[]
}

interface Analytics {
  repaymentScore: number
  fraudRiskScore: number
  paymentDelayProbability: number
  investorConfidenceScore: number
  buyerCreditScore: number
  buyerCreditRating: string
  recommendedDiscountRate: number
  investmentRecommendation: string
  explanation: string
  onTimeSettlementPercentage: number
  fraudIndicators: string[]
  auditTrail: any[]
}

export default function InvestorInvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [funding, setFunding] = useState(false)
  const [funded, setFunded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/invoices/${id}`).then(r => r.json()),
      fetch('/api/ai/investor-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: id }),
      }).then(r => r.json()),
    ])
      .then(([inv, ai]) => {
        setInvoice(inv)
        setAnalytics(ai)
        if (inv.status === 'funded' || inv.status === 'settled') setFunded(true)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleFund() {
    if (!invoice) return
    setFunding(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'funded' }),
      })
      if (!res.ok) throw new Error('Funding failed')
      setFunded(true)
      setInvoice(prev => prev ? { ...prev, status: 'funded' } : prev)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setFunding(false)
    }
  }

  const label = invoice?.immutable_id ?? invoice?.invoice_no ?? (id?.toUpperCase() ?? '')
  const buyerName = invoice?.buyer?.buyer_profiles?.company_name ?? invoice?.buyer?.name ?? 'Unknown Buyer'
  const supplierName = invoice?.supplier?.supplier_profiles?.company_name ?? invoice?.supplier?.name ?? 'Unknown Supplier'
  const rate = invoice?.discount_rate ?? analytics?.recommendedDiscountRate ?? 1.4

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex antialiased">
      {/* Sidebar */}
      <nav className="hidden md:flex flex-col h-screen py-8 gap-gutter bg-surface-container border-r border-outline-variant w-64 shrink-0 sticky top-0">
        <div className="px-6 pb-8 border-b border-outline-variant/30">
          <span className="flex items-center gap-2"><img src="/chainbill-logo.png" alt="ChainBill" className="h-7 w-7 object-contain shrink-0" /><span className="font-label-lg text-[18px] font-bold text-primary truncate">ChainBill</span></span>
          <p className="font-label-sm text-label-sm text-tertiary mt-2 uppercase tracking-widest">Investor Portal</p>
        </div>
        <div className="flex-1 flex flex-col gap-2 px-4 mt-8">
          <Link href="/investor/marketplace" className="bg-primary text-on-primary rounded-full px-6 py-3 flex items-center gap-2 scale-95">
            <span className="material-symbols-outlined">storefront</span>
            <span className="font-label-md text-label-md">Marketplace</span>
          </Link>
          <Link href="/investor/portfolio" className="text-on-surface-variant px-6 py-3 flex items-center gap-2 hover:text-primary hover:bg-surface-variant/50 rounded-full">
            <span className="material-symbols-outlined">pie_chart</span>
            <span className="font-label-md text-label-md">My Portfolio</span>
          </Link>
          <Link href="/investor/settlement-history" className="text-on-surface-variant px-6 py-3 flex items-center gap-2 hover:text-primary hover:bg-surface-variant/50 rounded-full">
            <span className="material-symbols-outlined">history</span>
            <span className="font-label-md text-label-md">Settlement History</span>
          </Link>
        </div>
        <div className="px-6 mt-auto">
          <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="w-full bg-on-surface text-surface py-3 px-6 rounded-full font-label-md text-label-md hover:bg-primary transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-h-screen max-w-[1440px] mx-auto w-full">
        <div className="p-margin-mobile md:p-margin-desktop flex-1">
          <nav className="mb-8 font-label-md text-label-md text-tertiary flex items-center gap-2 uppercase">
            <Link href="/investor/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
            <span className="text-on-surface">Invoice {label}</span>
          </nav>

          {loading ? (
            <div className="text-on-surface-variant py-12">Loading invoice details…</div>
          ) : !invoice ? (
            <div className="text-error py-12">Invoice not found.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
              {/* Main content */}
              <div className="lg:col-span-2 flex flex-col gap-gutter">
                {/* Invoice header card */}
                <BorderGlow
                  backgroundColor="#fdf9ee"
                  borderRadius={12}
                  colors={['#c084fc', '#f472b6', '#38bdf8']}
                  glowColor="270 50 70"
                  glowIntensity={1.0}
                  edgeSensitivity={20}
                >
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-outline-variant/50 pb-8">
                      <div>
                        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-2">{label}</h2>
                        <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm uppercase px-3 py-1 rounded-full">
                          {invoice.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-label-md text-label-md text-tertiary uppercase mb-2">Invoice Amount</p>
                        <div className="font-headline-lg text-headline-lg text-primary">₹{invoice.amount.toLocaleString('en-IN')}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {[
                        ['Buyer', buyerName],
                        ['Supplier', supplierName],
                        ['Due Date', new Date(invoice.due_date).toLocaleDateString('en-IN')],
                        ['Description', invoice.description],
                        ['GST No.', invoice.gst_no ?? '—'],
                        ['Payment Terms', invoice.payment_terms ?? '—'],
                      ].map(([k, v]) => (
                        <div key={k as string}>
                          <p className="font-label-sm text-label-sm text-tertiary uppercase mb-1">{k}</p>
                          <p className="font-body-md text-body-md text-on-surface">{v}</p>
                        </div>
                      ))}
                    </div>

                    {invoice.blockchain_tx_hash && (
                      <div className="mt-6 p-4 bg-surface-container rounded-lg">
                        <p className="font-label-sm text-label-sm text-tertiary uppercase mb-1">Blockchain TX</p>
                        <p className="font-mono text-xs text-on-surface-variant break-all">{invoice.blockchain_tx_hash}</p>
                      </div>
                    )}
                  </div>
                </BorderGlow>

                {/* AI Analytics card */}
                {analytics && (
                  <BorderGlow
                    backgroundColor="#fdf9ee"
                    borderRadius={12}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    glowColor="270 50 70"
                    glowIntensity={1.0}
                    edgeSensitivity={20}
                  >
                    <div className="p-8">
                      <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-6">AI Risk Analysis</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                        {[
                          ['Repayment Score', `${analytics.repaymentScore}/100`],
                          ['Fraud Risk', `${analytics.fraudRiskScore}/100`],
                          ['Confidence', `${analytics.investorConfidenceScore}%`],
                          ['Buyer Credit', `${analytics.buyerCreditScore} (${analytics.buyerCreditRating})`],
                          ['On-Time %', `${analytics.onTimeSettlementPercentage}%`],
                          ['Recommendation', analytics.investmentRecommendation.replace(/_/g, ' ')],
                        ].map(([k, v]) => (
                          <div key={k as string} className="bg-surface-container rounded-lg p-4">
                            <p className="font-label-sm text-label-sm text-tertiary uppercase mb-1">{k}</p>
                            <p className="font-body-lg text-body-lg font-bold text-on-surface">{v}</p>
                          </div>
                        ))}
                      </div>
                      <p className="font-body-md text-body-md text-on-surface-variant">{analytics.explanation}</p>
                    </div>
                  </BorderGlow>
                )}

                {/* Audit trail card */}
                {(analytics?.auditTrail ?? invoice.audit_trail ?? []).length > 0 && (
                  <BorderGlow
                    backgroundColor="#fdf9ee"
                    borderRadius={12}
                    colors={['#c084fc', '#f472b6', '#38bdf8']}
                    glowColor="270 50 70"
                    glowIntensity={1.0}
                    edgeSensitivity={20}
                  >
                    <div className="p-8">
                      <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-6">Audit Trail</h3>
                      <div className="space-y-4">
                        {(analytics?.auditTrail ?? invoice.audit_trail).map((entry: any) => (
                          <div key={entry.id} className="flex gap-4 items-start">
                            <span className="material-symbols-outlined text-primary mt-1">verified</span>
                            <div>
                              <p className="font-label-md text-label-md text-on-surface">{entry.action}</p>
                              <p className="font-mono text-xs text-on-surface-variant">{entry.tx_hash?.slice(0, 20)}…</p>
                              <p className="font-label-sm text-label-sm text-tertiary">{new Date(entry.created_at).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </BorderGlow>
                )}
              </div>

              {/* Fund sidebar */}
              <div className="lg:col-span-1 sticky top-8">
                <div className="bg-primary text-on-primary rounded-xl p-8 flex flex-col gap-6">
                  <h3 className="font-headline-lg text-headline-lg-mobile border-b border-on-primary/20 pb-4">Investment Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="opacity-80">Amount</span>
                      <span className="font-bold">₹{invoice.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Monthly Return</span>
                      <span className="font-bold">{rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-80">Due Date</span>
                      <span className="font-bold">{new Date(invoice.due_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  {error && <p className="text-sm bg-error-container text-on-error-container rounded p-2">{error}</p>}

                  {funded ? (
                    <div className="w-full py-4 bg-on-primary text-primary rounded-full font-label-md text-label-md text-center">
                      ✓ Funded
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={funding || invoice.status !== 'listed'}
                      onClick={handleFund}
                      className="w-full py-4 bg-on-primary text-primary rounded-full font-label-md text-label-md hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {funding ? 'Processing…' : invoice.status !== 'listed' ? `Status: ${invoice.status}` : 'Fund This Invoice'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
