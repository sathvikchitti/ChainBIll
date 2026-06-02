'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import BorderGlow from '@/components/BorderGlow'

interface Invoice {
  id: string
  invoice_no: string
  amount: number
  status: string
  due_date: string
  supplier: { name: string; supplier_profiles: { company_name: string } | null } | null
}

export default function BuyerUpcomingSettlementsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/invoices?status=funded')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInvoices(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="font-body-md text-body-md antialiased min-h-screen flex bg-background">
      <nav className="bg-surface border-r border-outline-variant h-screen w-64 fixed left-0 top-0 flex flex-col py-8 px-4 z-20 hidden md:flex">
        <div className="mb-8">
          <span className="flex items-center gap-2"><img src="/chainbill-logo.png" alt="ChainBill" className="h-7 w-7 object-contain shrink-0" /><span className="font-label-lg text-[18px] font-bold text-primary truncate">ChainBill</span></span>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">Buyer Portal</p>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <Link href="/buyer/pending-confirmations" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full font-label-md text-label-md"><span className="material-symbols-outlined">pending_actions</span>Pending Confirmations</Link>
          <Link href="/buyer/confirmed-history" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full font-label-md text-label-md"><span className="material-symbols-outlined">history</span>Confirmed History</Link>
          <Link href="/buyer/upcoming-settlements" className="flex items-center gap-3 px-4 py-3 text-on-primary bg-primary rounded-full font-label-md text-label-md scale-95"><span className="material-symbols-outlined">account_balance_wallet</span>Upcoming Settlements</Link>
        </div>
        <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="mt-auto w-full py-3 bg-on-surface text-surface rounded-full font-label-md text-label-md hover:bg-primary transition-colors">Sign Out</button>
      </nav>

      <div className="flex-1 md:ml-64 flex flex-col">
        <header className="bg-surface/80 backdrop-blur-md fixed top-0 right-0 md:left-64 left-0 h-16 border-b border-outline-variant flex items-center px-margin-mobile md:px-margin-desktop z-10">
          <h2 className="font-headline-lg text-[20px] text-on-surface">Upcoming Settlements</h2>
        </header>

        <main className="flex-1 pt-24 px-margin-mobile md:px-margin-desktop pb-section-gap">
          <div className="mb-12">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Upcoming Settlements</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">Funded invoices where payment is due to the investor.</p>
          </div>

          {loading ? (
            <div className="text-on-surface-variant py-8">Loading…</div>
          ) : invoices.length === 0 ? (
            <div className="text-on-surface-variant py-8">No upcoming settlements. Funded invoices will appear here.</div>
          ) : (
            <div className="flex flex-col gap-stack-gap">
              {invoices.map(inv => {
                const supplierName = inv.supplier?.supplier_profiles?.company_name ?? inv.supplier?.name ?? 'Unknown'
                const daysUntilDue = Math.ceil((new Date(inv.due_date).getTime() - Date.now()) / 86400000)
                const urgent = daysUntilDue <= 7
                return (
                  <BorderGlow
                    key={inv.id}
                    backgroundColor="#fdf9ee"
                    borderRadius={12}
                    colors={urgent ? ['#f87171', '#fb923c', '#fbbf24'] : ['#c084fc', '#f472b6', '#38bdf8']}
                    glowColor={urgent ? '0 80 60' : '270 50 70'}
                    glowIntensity={urgent ? 1.3 : 1.0}
                    edgeSensitivity={20}
                  >
                    <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{inv.invoice_no}</span>
                          {urgent && <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2 py-1 rounded">Due Soon</span>}
                        </div>
                        <p className="font-headline-lg text-[24px] text-primary mb-1">₹{inv.amount.toLocaleString('en-IN')}</p>
                        <p className="font-body-md text-body-md text-on-surface-variant">{supplierName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Due in</p>
                        <p className={`font-headline-lg text-[20px] ${urgent ? 'text-error' : 'text-on-surface'}`}>{daysUntilDue} days</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{new Date(inv.due_date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                  </BorderGlow>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
