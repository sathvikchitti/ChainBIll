'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'

interface Settlement {
  id: string
  principal_amount: number
  return_amount: number
  roi: number
  settled_at: string
  invoice: {
    invoice_no: string
    amount: number
    buyer: { name: string; buyer_profiles: { company_name: string } | null } | null
    supplier: { name: string; supplier_profiles: { company_name: string } | null } | null
  } | null
}

interface Stats {
  settledCount: number
  totalPrincipal: number
  totalReturns: number
  netProfit: number
  avgROI: number
  onTimePercentage: number
}

export default function InvestorSettlementHistoryPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    fetch('/api/settlement')
      .then(r => r.json())
      .then(data => {
        setSettlements(data.settlements ?? [])
        setStats(data.stats ?? null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex antialiased">
      <nav className="hidden md:flex flex-col h-screen py-8 bg-surface-container border-r border-outline-variant w-64 shrink-0 sticky top-0 px-4">
        <div className="mb-8 px-2">
          <span className="flex items-center gap-2"><img src="/chainbill-logo.png" alt="ChainBill" className="h-7 w-7 object-contain shrink-0" /><span className="font-label-lg text-[18px] font-bold text-primary truncate">ChainBill</span></span>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">Investor Portal</p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Link href="/investor/marketplace" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-primary-container/20 rounded-full font-label-md text-label-md"><span className="material-symbols-outlined">storefront</span>Marketplace</Link>
          <Link href="/investor/portfolio" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-primary-container/20 rounded-full font-label-md text-label-md"><span className="material-symbols-outlined">pie_chart</span>My Portfolio</Link>
          <Link href="/investor/settlement-history" className="flex items-center gap-3 text-on-primary bg-primary rounded-full px-4 py-2 font-label-md text-label-md scale-95"><span className="material-symbols-outlined">receipt_long</span>Settlements</Link>
        </div>
        <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="mt-auto w-full py-3 bg-on-surface text-surface rounded-full font-label-md text-label-md hover:bg-primary transition-colors">Sign Out</button>
      </nav>

      <main className="flex-1 p-margin-mobile md:p-margin-desktop">
        <header className="mb-12">
          <p className="font-label-sm text-label-sm text-outline mb-4 uppercase tracking-widest">Investor Portal</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Settlement History</h1>
        </header>

        {/* Stats summary */}
        {stats && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter mb-12">
            {[
              { label: 'Settlements', value: stats.settledCount },
              { label: 'Total Returns', value: `₹${stats.totalReturns.toLocaleString('en-IN')}` },
              { label: 'Net Profit', value: `₹${stats.netProfit.toLocaleString('en-IN')}` },
              { label: 'Avg ROI', value: `${stats.avgROI}%` },
              { label: 'On-Time %', value: `${stats.onTimePercentage}%` },
              { label: 'Total Invested', value: `₹${stats.totalPrincipal.toLocaleString('en-IN')}` },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">{s.label}</p>
                <p className="font-headline-lg text-[22px] text-primary">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-on-surface-variant py-8">Loading settlement history…</div>
        ) : settlements.length === 0 ? (
          <div className="text-on-surface-variant py-8">
            No settled investments yet.{' '}
            <Link href="/investor/marketplace" className="text-primary underline">Browse the marketplace →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant font-label-sm text-label-sm uppercase">
                  <th className="text-left py-3 pr-6">Invoice</th>
                  <th className="text-left py-3 pr-6">Buyer</th>
                  <th className="text-right py-3 pr-6">Principal</th>
                  <th className="text-right py-3 pr-6">Return</th>
                  <th className="text-right py-3 pr-6">ROI</th>
                  <th className="text-left py-3">Settled On</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map(s => {
                  const buyerName = s.invoice?.buyer?.buyer_profiles?.company_name ?? s.invoice?.buyer?.name ?? '—'
                  return (
                    <tr key={s.id} className="border-b border-outline-variant/50 hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="py-4 pr-6">
                        <span className="font-label-md text-label-md text-on-surface">{s.invoice?.invoice_no ?? '—'}</span>
                      </td>
                      <td className="py-4 pr-6 text-on-surface-variant">{buyerName}</td>
                      <td className="py-4 pr-6 text-right font-label-md text-label-md text-on-surface">₹{s.principal_amount.toLocaleString('en-IN')}</td>
                      <td className="py-4 pr-6 text-right font-label-md text-label-md text-primary">₹{s.return_amount.toLocaleString('en-IN')}</td>
                      <td className="py-4 pr-6 text-right">
                        <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-1 rounded">{s.roi}%</span>
                      </td>
                      <td className="py-4 text-on-surface-variant font-label-sm text-label-sm">
                        {new Date(s.settled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
