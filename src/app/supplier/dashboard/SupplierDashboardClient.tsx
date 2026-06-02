'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import BorderGlow from '@/components/BorderGlow'

interface Invoice {
  id: string
  invoice_no: string
  amount: number
  status: string
  due_date: string
  created_at: string
}

interface Stats {
  total: number
  pending: number
  funded: number
  settled: number
  totalValue: number
}

export function SupplierDashboardClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()

  useEffect(() => {
    fetch('/api/invoices')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInvoices(data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const stats: Stats = invoices.reduce((acc, inv) => {
    acc.total++
    acc.totalValue += inv.amount
    if (inv.status === 'pending') acc.pending++
    if (inv.status === 'funded') acc.funded++
    if (inv.status === 'settled') acc.settled++
    return acc
  }, { total: 0, pending: 0, funded: 0, settled: 0, totalValue: 0 })

  const recent = invoices.slice(0, 5)

  const statusColor: Record<string, string> = {
    pending: 'bg-secondary-container text-on-secondary-container',
    verified: 'bg-primary-container text-on-primary-container',
    listed: 'bg-tertiary-container text-on-tertiary-container',
    funded: 'bg-primary-container text-on-primary-container',
    settled: 'bg-surface-container text-on-surface-variant',
    draft: 'bg-surface-variant text-on-surface-variant',
    disputed: 'bg-error-container text-on-error-container',
  }

  return (
    <div className="text-on-background font-body-md h-screen flex overflow-hidden bg-background">
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col h-full z-10 shrink-0">
        <div className="p-gutter border-b border-outline-variant">
          <img src="/chainbill-logo.png" alt="ChainBill" className="h-7 w-7 object-contain shrink-0" />
          <span className="text-[18px] font-bold text-primary truncate">ChainBill</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-stack-gap px-2 flex flex-col gap-2">
          <Link className="flex items-center justify-between px-stack-gap py-2 rounded-xl bg-primary-container text-on-primary-container" href="/supplier/dashboard">
            <span className="font-label-md text-label-md font-bold">Dashboard</span>
          </Link>
          <Link className="flex items-center justify-between px-stack-gap py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" href="/supplier/raise-invoice">
            <span className="font-label-md text-label-md">Raise Invoice</span>
          </Link>
          <Link className="flex items-center justify-between px-stack-gap py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" href="/supplier/my-invoices">
            <span className="font-label-md text-label-md">My Invoices</span>
          </Link>
          <Link className="flex items-center justify-between px-stack-gap py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors" href="/supplier/credit-history">
            <span className="font-label-md text-label-md">Credit History</span>
          </Link>
        </nav>
        <div className="p-gutter border-t border-outline-variant flex flex-col gap-4">
          <button
            type="button"
            onClick={() => router.push('/supplier/raise-invoice')}
            className="w-full py-2 px-stack-gap bg-on-background text-surface-container-lowest font-label-md text-label-md uppercase tracking-wider rounded active:opacity-80 transition-opacity"
          >
            NEW INVOICE
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full py-2 px-stack-gap border border-outline text-on-surface font-label-md text-label-md rounded hover:bg-surface-container transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="p-gutter border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Supplier Dashboard</h1>
        </header>

        <div className="p-gutter space-y-gutter">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {[
              { label: 'Total Invoices', value: stats.total },
              { label: 'Pending', value: stats.pending },
              { label: 'Funded', value: stats.funded },
              { label: 'Settled', value: stats.settled },
            ].map(s => (
              <BorderGlow
                key={s.label}
                backgroundColor="#ffffff"
                borderRadius={12}
                colors={['#c084fc', '#f472b6', '#38bdf8']}
                glowColor="270 50 70"
                glowIntensity={1.0}
                edgeSensitivity={20}
              >
                <div className="p-6">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-2">{s.label}</p>
                  <p className="font-headline-lg text-[32px] text-primary">{loading ? '—' : s.value}</p>
                </div>
              </BorderGlow>
            ))}
          </div>

          {/* Total value */}
          <div className="bg-primary text-on-primary rounded-xl p-6">
            <p className="font-label-sm text-label-sm uppercase opacity-80 mb-2">Total Invoice Value</p>
            <p className="font-headline-lg text-[36px]">₹{loading ? '—' : stats.totalValue.toLocaleString('en-IN')}</p>
          </div>

          {/* Recent invoices */}
          <BorderGlow
            backgroundColor="#ffffff"
            borderRadius={12}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            glowColor="270 50 70"
            glowIntensity={1.0}
            edgeSensitivity={20}
          >
            <div className="p-6">
            <h2 className="font-headline-lg text-headline-lg-mobile text-on-surface mb-4">Recent Invoices</h2>
            {loading ? (
              <p className="text-on-surface-variant">Loading…</p>
            ) : recent.length === 0 ? (
              <p className="text-on-surface-variant">No invoices yet. <Link href="/supplier/raise-invoice" className="text-primary underline">Raise your first invoice</Link>.</p>
            ) : (
              <div className="space-y-3">
                {recent.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2 border-b border-outline-variant/50 last:border-0">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{inv.invoice_no}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">₹{inv.amount.toLocaleString('en-IN')}</p>
                    </div>
                    <span className={`font-label-sm text-label-sm uppercase px-2 py-1 rounded-full ${statusColor[inv.status] ?? 'bg-surface-variant text-on-surface-variant'}`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
            </div>
          </BorderGlow>
        </div>
      </main>
    </div>
  )
}
