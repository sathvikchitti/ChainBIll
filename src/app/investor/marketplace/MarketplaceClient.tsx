'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'

interface Invoice {
  id: string
  invoice_no: string
  immutable_id: string | null
  amount: number
  status: string
  discount_rate: number | null
  due_date: string
  buyer: { name: string; buyer_profiles: { company_name: string; credit_score: number } | null } | null
  supplier: { name: string; supplier_profiles: { company_name: string } | null } | null
}

function riskLabel(creditScore: number | null) {
  const s = creditScore ?? 720
  if (s >= 780) return { label: 'Low Risk', cls: 'bg-primary-container text-on-primary-container' }
  if (s >= 680) return { label: 'Med Risk', cls: 'bg-secondary-container text-on-secondary-container' }
  return { label: 'High Risk', cls: 'bg-error-container text-on-error-container' }
}

function creditRating(creditScore: number | null) {
  const s = creditScore ?? 720
  if (s >= 800) return 'AAA'
  if (s >= 750) return 'AA'
  if (s >= 700) return 'A'
  if (s >= 650) return 'BBB'
  return 'BB'
}

export function MarketplaceClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    fetch('/api/invoices?status=listed')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInvoices(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen flex flex-col antialiased">
      <main className="flex-grow flex">
        <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant py-8 px-4 z-40">
          <div className="mb-8 px-4">
            <span className="flex items-center gap-2"><img src="/chainbill-logo.png" alt="ChainBill" className="h-7 w-7 object-contain shrink-0" /><span className="font-label-lg text-[18px] font-bold text-primary truncate">ChainBill</span></span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Investor Portal</p>
          </div>
          <nav className="flex-1 flex flex-col gap-2">
            <Link
              href="/investor/marketplace"
              className="flex items-center gap-3 text-on-primary bg-primary rounded-full px-4 py-2 transition-all scale-95 font-label-md text-label-md"
            >
              <span className="material-symbols-outlined">storefront</span>
              Marketplace
            </Link>
            <Link href="/investor/portfolio" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-primary-container/20 rounded-full transition-all font-label-md text-label-md">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Portfolio
            </Link>
            <Link href="/investor/settlement-history" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-primary-container/20 rounded-full transition-all font-label-md text-label-md">
              <span className="material-symbols-outlined">receipt_long</span>
              Settlements
            </Link>
          </nav>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-auto w-full py-3 bg-on-surface text-surface rounded-full font-label-md text-label-md hover:bg-primary transition-colors"
          >
            Sign Out
          </button>
        </aside>

        <div className="w-full md:pl-64 flex flex-col">
          <header className="px-margin-mobile md:px-margin-desktop pt-16 pb-8">
            <h1 className="font-headline-xl text-headline-xl text-on-surface">Live Invoice Marketplace</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-4 max-w-2xl">
              Verified, blockchain-backed invoices from MSMEs across India.
            </p>
          </header>

          <div className="w-full bg-surface-container-high py-4 px-margin-mobile md:px-margin-desktop border-y border-outline-variant">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 font-label-md text-label-md text-secondary">
              <span>₹{(invoices.reduce((s, i) => s + i.amount, 0) / 1e7).toFixed(1)} Cr available</span>
              <span className="text-outline hidden sm:inline">•</span>
              <span>{invoices.length} active invoices</span>
            </div>
          </div>

          <div className="px-margin-mobile md:px-margin-desktop py-12">
            {loading ? (
              <div className="text-on-surface-variant py-12">Loading marketplace…</div>
            ) : invoices.length === 0 ? (
              <div className="text-on-surface-variant py-12">No invoices listed in the marketplace yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {invoices.map(inv => {
                  const creditScore = inv.buyer?.buyer_profiles?.credit_score ?? null
                  const risk = riskLabel(creditScore)
                  const rating = creditRating(creditScore)
                  const buyerName = inv.buyer?.buyer_profiles?.company_name ?? inv.buyer?.name ?? 'Unknown Buyer'
                  const daysLeft = Math.ceil((new Date(inv.due_date).getTime() - Date.now()) / 86400000)
                  const rate = inv.discount_rate ?? 1.4
                  return (
                    <Link
                      href={`/investor/invoice-details/${inv.id}`}
                      key={inv.id}
                      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col gap-6 hover:border-primary transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">{rating}</p>
                          <h3 className="font-headline-lg text-[24px] text-primary leading-none">
                            ₹{inv.amount.toLocaleString('en-IN')}
                          </h3>
                        </div>
                        <span className={`font-label-sm text-label-sm px-2 py-1 rounded-full ${risk.cls}`}>
                          {risk.label}
                        </span>
                      </div>
                      <div className="space-y-3 flex-1">
                        <div className="flex justify-between border-b border-surface-variant pb-2">
                          <span className="text-on-surface-variant text-sm">Buyer</span>
                          <span className="font-medium text-on-surface text-sm">{buyerName}</span>
                        </div>
                        <div className="flex justify-between border-b border-surface-variant pb-2">
                          <span className="text-on-surface-variant text-sm">Return</span>
                          <span className="font-medium text-on-surface text-sm">{rate}% / month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-on-surface-variant text-sm">Due in</span>
                          <span className="font-medium text-on-surface text-sm">{daysLeft} days</span>
                        </div>
                      </div>
                      <div className="text-primary font-label-md text-label-md flex items-center gap-1">
                        View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
