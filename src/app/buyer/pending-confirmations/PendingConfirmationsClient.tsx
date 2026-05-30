'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface Invoice {
  id: string
  invoice_no: string
  amount: number
  status: string
  supplier: { name: string; supplier_profiles: { company_name: string } | null } | null
  created_at: string
  due_date: string
}

export function PendingConfirmationsClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    fetch('/api/invoices?status=pending')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setInvoices(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function confirmInvoice(invoiceId: string) {
    setConfirming(invoiceId)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'buyer_confirmed' }),
      })
      if (!res.ok) throw new Error('Failed to confirm')
      setInvoices(prev => prev.filter(i => i.id !== invoiceId))
    } catch (err) {
      console.error(err)
    } finally {
      setConfirming(null)
    }
  }

  return (
    <div className="font-body-md text-body-md antialiased min-h-screen flex bg-background">
      <nav className="bg-surface dark:bg-surface-dim font-body-md text-body-md font-label-md text-label-md h-screen w-64 fixed left-0 top-0 border-r border-outline-variant dark:border-outline flex flex-col h-full p-stack-gap z-20 hidden md:flex">
        <div className="mb-12 mt-6 px-4">
          <h1 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed">ChainBill</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mt-1">Buyer Portal</p>
        </div>
        <div className="flex-1 space-y-2">
          <Link
            href="/buyer/pending-confirmations"
            className="flex items-center gap-3 px-4 py-3 text-on-primary-container bg-primary-container dark:bg-primary-fixed dark:text-on-primary-fixed-variant font-bold rounded-full scale-[0.98] transition-transform duration-150"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>pending_actions</span>
            <span>Pending Confirmations</span>
          </Link>
          <Link
            href="/buyer/confirmed-history"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-on-surface hover:text-primary hover:bg-surface-container-high dark:hover:bg-surface-variant transition-colors duration-200 rounded-full"
          >
            <span className="material-symbols-outlined">history</span>
            <span>Confirmed History</span>
          </Link>
          <Link
            href="/buyer/upcoming-settlements"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant dark:text-on-surface hover:text-primary hover:bg-surface-container-high dark:hover:bg-surface-variant transition-colors duration-200 rounded-full"
          >
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span>Upcoming Settlements</span>
          </Link>
        </div>
        <div className="mt-auto pt-6 px-4">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full py-3 bg-on-surface text-surface rounded-full font-label-md text-label-md hover:bg-primary transition-colors"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md fixed top-0 right-0 md:left-64 left-0 h-16 border-b border-outline-variant flex justify-between items-center px-margin-mobile md:px-margin-desktop z-10">
          <span className="font-headline-lg text-[24px] text-primary font-bold md:hidden">ChainBill</span>
          <span className="hidden md:block font-label-md text-on-surface-variant">Buyer Portal</span>
        </header>

        <main className="flex-1 pt-24 px-margin-mobile md:px-margin-desktop pb-section-gap">
          <div className="mb-12 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-label-sm text-label-sm uppercase bg-secondary-container text-on-secondary-container px-2 py-1 rounded tracking-wider">
                Action Required
              </span>
              {!loading && (
                <span className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  {invoices.length} Awaiting Confirmation
                </span>
              )}
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Pending Confirmations</h2>
          </div>

          {loading ? (
            <div className="text-on-surface-variant font-body-md py-12">Loading invoices…</div>
          ) : invoices.length === 0 ? (
            <div className="text-on-surface-variant font-body-md py-12">No pending invoices awaiting your confirmation.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {invoices.map(inv => {
                const supplierName = inv.supplier?.supplier_profiles?.company_name ?? inv.supplier?.name ?? 'Unknown Supplier'
                const daysUntilDue = Math.ceil((new Date(inv.due_date).getTime() - Date.now()) / 86400000)
                return (
                  <div
                    key={inv.id}
                    className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">{inv.invoice_no}</p>
                        <h3 className="font-headline-lg text-[28px] text-primary leading-none">
                          ₹{inv.amount.toLocaleString('en-IN')}
                        </h3>
                      </div>
                      <span className="font-label-sm text-label-sm uppercase bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full">
                        Pending
                      </span>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between border-b border-surface-variant pb-2">
                        <span className="text-on-surface-variant">Supplier</span>
                        <span className="font-medium text-on-surface">{supplierName}</span>
                      </div>
                      <div className="flex justify-between border-b border-surface-variant pb-2">
                        <span className="text-on-surface-variant">Due</span>
                        <span className="font-medium text-on-surface">{daysUntilDue} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Date</span>
                        <span className="font-medium text-on-surface">
                          {new Date(inv.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      <button
                        type="button"
                        disabled={confirming === inv.id}
                        onClick={() => confirmInvoice(inv.id)}
                        className="w-full py-3 bg-on-surface text-surface rounded-lg font-label-md text-label-md hover:bg-primary transition-colors disabled:opacity-50"
                      >
                        {confirming === inv.id ? 'Confirming…' : 'Confirm on Blockchain'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
