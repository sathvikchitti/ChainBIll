'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'

interface ActiveInvoice {
  id: string
  invoice_no: string
  amount: number
  due_date: string
  status: string
  buyer: { name: string; buyer_profiles: { company_name: string } | null } | null
  supplier: { name: string; supplier_profiles: { company_name: string } | null } | null
}

interface Stats {
  activeCount: number
  settledCount: number
  totalPrincipal: number
  totalReturns: number
  netProfit: number
  avgROI: number
}

export default function InvestorPortfolioPage() {
  const [active, setActive] = useState<ActiveInvoice[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    fetch('/api/settlement')
      .then(r => r.json())
      .then(data => {
        setActive(data.activeInvoices ?? [])
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
          <Link href="/investor/portfolio" className="flex items-center gap-3 text-on-primary bg-primary rounded-full px-4 py-2 font-label-md text-label-md scale-95"><span className="material-symbols-outlined">pie_chart</span>My Portfolio</Link>
          <Link href="/investor/settlement-history" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-primary-container/20 rounded-full font-label-md text-label-md"><span className="material-symbols-outlined">receipt_long</span>Settlements</Link>
        </div>
        <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="mt-auto w-full py-3 bg-on-surface text-surface rounded-full font-label-md text-label-md hover:bg-primary transition-colors">Sign Out</button>
      </nav>

      <main className="flex-1 p-margin-mobile md:p-margin-desktop">
        <header className="mb-12">
          <p className="font-label-sm text-label-sm text-outline mb-4 uppercase tracking-widest">Investor Portal</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">My Portfolio</h1>
        </header>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter mb-12">
            {[
              { label: 'Active Investments', value: stats.activeCount },
              { label: 'Settled', value: stats.settledCount },
              { label: 'Total Invested', value: `₹${stats.totalPrincipal.toLocaleString('en-IN')}` },
              { label: 'Net Profit', value: `₹${stats.netProfit.toLocaleString('en-IN')}` },
            ].map(s => (
              <div key={s.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">{s.label}</p>
                <p className="font-headline-lg text-[24px] text-primary">{loading ? '—' : s.value}</p>
              </div>
            ))}
          </div>
        )}

        <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-6">Active Investments</h2>

        {loading ? (
          <div className="text-on-surface-variant py-8">Loading portfolio…</div>
        ) : active.length === 0 ? (
          <div className="text-on-surface-variant py-8">
            No active investments yet.{' '}
            <Link href="/investor/marketplace" className="text-primary underline">Browse the marketplace →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-stack-gap">
            {active.map(inv => {
              const buyerName = inv.buyer?.buyer_profiles?.company_name ?? inv.buyer?.name ?? 'Unknown'
              const supplierName = inv.supplier?.supplier_profiles?.company_name ?? inv.supplier?.name ?? 'Unknown'
              const daysLeft = Math.ceil((new Date(inv.due_date).getTime() - Date.now()) / 86400000)
              return (
                <div key={inv.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{inv.invoice_no}</span>
                      <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-2 py-1 rounded">Funded</span>
                    </div>
                    <p className="font-headline-lg text-[24px] text-primary mb-1">₹{inv.amount.toLocaleString('en-IN')}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">{supplierName} → {buyerName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Due in</p>
                    <p className="font-headline-lg text-[20px] text-on-surface">{daysLeft} days</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
