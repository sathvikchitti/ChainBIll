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
  description: string
  due_date: string
  blockchain_tx_hash: string | null
  buyer: { name: string; buyer_profiles: { company_name: string } | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-surface-variant text-on-surface-variant',
  pending: 'bg-secondary-container text-on-secondary-container',
  verified: 'bg-primary-container text-on-primary-container',
  listed: 'bg-tertiary-container text-on-tertiary-container',
  funded: 'bg-primary-container text-on-primary-container',
  settled: 'bg-surface-variant text-outline',
  disputed: 'bg-error-container text-on-error-container',
}

const TABS = ['All', 'Pending', 'Verified', 'Listed', 'Funded', 'Settled']

export default function SupplierMyInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [listing, setListing] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInvoices(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = invoices.filter(inv => {
    if (activeTab === 'All') return true
    return inv.status.toLowerCase() === activeTab.toLowerCase()
  })

  async function listForFunding(invoiceId: string) {
    setListing(invoiceId)
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'listed', discount_rate: 1.4 }),
      })
      if (!res.ok) throw new Error('Failed to list')
      setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'listed' } : i))
    } catch (err) {
      console.error(err)
    } finally {
      setListing(null)
    }
  }

  return (
    <div className="bg-surface text-on-surface font-body-md antialiased flex min-h-screen">
      <nav className="bg-surface-container-low border-r border-outline-variant h-screen w-64 fixed left-0 top-0 flex flex-col py-8 px-4 z-40 hidden md:flex">
        <div className="mb-8">
          <Link href="/supplier/dashboard" className="block">
            <span className="flex items-center gap-2"><img src="/chainbill-logo.png" alt="ChainBill" className="h-7 w-7 object-contain shrink-0" /><span className="font-label-lg text-[18px] font-bold text-primary truncate">ChainBill</span></span>
          </Link>
          <p className="font-label-sm text-label-sm mt-1 text-on-surface-variant uppercase tracking-widest">Supplier Portal</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/supplier/raise-invoice')}
          className="bg-primary text-on-primary w-full py-3 px-4 rounded-xl font-label-md text-label-md mb-8 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Create Invoice
        </button>
        <ul className="flex flex-col gap-2 flex-grow">
          <li><Link href="/supplier/dashboard" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-primary-container/20 rounded-full transition-all font-label-md text-label-md"><span className="material-symbols-outlined">dashboard</span>Dashboard</Link></li>
          <li><Link href="/supplier/my-invoices" className="flex items-center gap-3 text-on-primary bg-primary rounded-full px-4 py-2 font-label-md text-label-md scale-95"><span className="material-symbols-outlined">description</span>Invoices</Link></li>
          <li><Link href="/supplier/raise-invoice" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-primary-container/20 rounded-full transition-all font-label-md text-label-md"><span className="material-symbols-outlined">add_circle</span>Raise Invoice</Link></li>
          <li><Link href="/supplier/credit-history" className="flex items-center gap-3 text-on-surface-variant px-4 py-2 hover:bg-primary-container/20 rounded-full transition-all font-label-md text-label-md"><span className="material-symbols-outlined">history</span>Credit History</Link></li>
        </ul>
        <div className="mt-auto pt-4 border-t border-outline-variant">
          <button type="button" onClick={() => signOut({ callbackUrl: '/' })} className="w-full py-2 px-4 border border-outline text-on-surface font-label-md text-label-md rounded-full hover:bg-surface-container transition-colors">Sign Out</button>
        </div>
      </nav>

      <main className="flex-1 ml-0 md:ml-64 min-h-screen bg-background p-margin-mobile md:p-margin-desktop">
        <header className="mb-12">
          <p className="font-label-sm text-label-sm text-outline mb-4 uppercase tracking-widest">Supplier Portal</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">My Invoices</h1>
        </header>

        {/* Tab filter */}
        <div className="flex border-b border-outline-variant mb-8 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`font-label-md text-label-md pb-3 px-4 whitespace-nowrap transition-colors ${
                activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-on-surface-variant py-12">Loading invoices…</div>
        ) : filtered.length === 0 ? (
          <div className="text-on-surface-variant py-12">
            No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} invoices.{' '}
            {activeTab === 'All' && <Link href="/supplier/raise-invoice" className="text-primary underline">Raise your first invoice →</Link>}
          </div>
        ) : (
          <div className="flex flex-col gap-stack-gap">
            {filtered.map(inv => {
              const buyerName = inv.buyer?.buyer_profiles?.company_name ?? inv.buyer?.name ?? 'Unknown Buyer'
              const dueDate = new Date(inv.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              const txDisplay = inv.blockchain_tx_hash ? `${inv.blockchain_tx_hash.slice(0, 6)}…${inv.blockchain_tx_hash.slice(-4)}` : 'Pending'
              const canList = inv.status === 'verified'
              const isSettled = inv.status === 'settled'

              return (
                <div
                  key={inv.id}
                  className={`bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isSettled ? 'opacity-70' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">{inv.invoice_no}</span>
                      <span className={`font-label-sm text-label-sm px-2 py-1 rounded ${STATUS_COLORS[inv.status] ?? 'bg-surface-variant text-on-surface-variant'}`}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </span>
                    </div>
                    <p className="font-headline-lg text-[24px] text-on-surface mb-1">₹{inv.amount.toLocaleString('en-IN')}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">{buyerName} — {inv.description}</p>
                    <div className="flex flex-wrap gap-4 font-label-sm text-label-sm text-outline">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        Due: {dueDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">link</span>
                        Tx: {txDisplay}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    {canList && (
                      <button
                        type="button"
                        disabled={listing === inv.id}
                        onClick={() => listForFunding(inv.id)}
                        className="bg-on-surface text-surface-container-lowest font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-primary transition-colors text-center w-full md:w-auto disabled:opacity-50"
                      >
                        {listing === inv.id ? 'Listing…' : 'List for Funding'}
                      </button>
                    )}
                    {inv.status === 'pending' && (
                      <button type="button" disabled className="bg-on-surface text-surface-container-lowest font-label-md text-label-md px-6 py-3 rounded-xl opacity-50 cursor-not-allowed w-full md:w-auto">
                        Awaiting Buyer Confirmation
                      </button>
                    )}
                    {isSettled && (
                      <span className="border border-outline text-outline font-label-md text-label-md px-6 py-3 rounded-xl flex items-center justify-center gap-2 w-full md:w-auto">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Settled
                      </span>
                    )}
                    {!canList && !isSettled && inv.status !== 'pending' && (
                      <span className="border border-outline text-on-surface-variant font-label-md text-label-md px-6 py-3 rounded-xl text-center w-full md:w-auto capitalize">
                        {inv.status}
                      </span>
                    )}
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
