'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import BorderGlow from '@/components/BorderGlow'

type AuditEvent = {
  id: string
  action: string
  created_at: string
  tx_hash: string
  metadata: Record<string, unknown> | null
  invoices: {
    invoice_no: string
    amount: number
  } | null
}

const ACTION_CONFIG: Record<string, { icon: string; badgeCls: string; color: string }> = {
  CREATED:     { icon: 'add_circle',             badgeCls: 'bg-primary-container text-on-primary-container border border-primary/20',     color: 'bg-primary text-on-primary' },
  VERIFIED:    { icon: 'verified',               badgeCls: 'bg-tertiary/10 text-tertiary border border-tertiary/20',                       color: 'bg-tertiary text-on-tertiary' },
  LISTED:      { icon: 'sell',                   badgeCls: 'bg-surface-container-high text-on-surface border border-outline-variant',       color: 'bg-on-surface text-surface' },
  FUNDED:      { icon: 'account_balance_wallet', badgeCls: 'bg-tertiary/10 text-tertiary border border-tertiary/20',                       color: 'bg-tertiary text-on-tertiary' },
  SETTLED:     { icon: 'check_circle',           badgeCls: 'bg-surface-container-high text-on-surface border border-outline-variant',       color: 'bg-surface-container-high text-on-surface' },
  DISPUTED:    { icon: 'warning',                badgeCls: 'bg-error-container text-on-error-container border border-error/20',             color: 'bg-error text-on-error' },
  DRAFT_SAVED: { icon: 'draft',                  badgeCls: 'bg-surface-container text-on-surface-variant border border-outline-variant',    color: 'bg-outline text-surface' },
}

const FILTERS = ['ALL', 'CREATED', 'FUNDED', 'SETTLED', 'DISPUTED', 'VERIFIED']
const PAGE_SIZE = 10

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  }
}

export default function SupplierCreditHistoryPage() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setEvents([])
    setPage(0)
    setHasMore(true)
  }, [filter])

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      const params = new URLSearchParams({
        filter,
        offset: String(page * PAGE_SIZE),
        limit: String(PAGE_SIZE),
      })
      const res = await fetch(`/api/credit-history?${params}`)
      if (!res.ok) { setLoading(false); return }
      const data: AuditEvent[] = await res.json()
      setEvents(prev => page === 0 ? data : [...prev, ...data])
      if (data.length < PAGE_SIZE) setHasMore(false)
      setLoading(false)
    }
    fetchEvents()
  }, [filter, page])

  const stats = [
    ['Total Events', events.length],
    ['Invoices Raised', events.filter(e => e.action === 'CREATED').length],
    ['Funded Count', events.filter(e => e.action === 'FUNDED').length],
    ['Settled Count', events.filter(e => e.action === 'SETTLED').length],
  ]

  return (
    <div className="bg-background text-on-background min-h-screen antialiased flex">
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container border-r border-outline-variant py-8 px-6 z-50">
        <div className="mb-8 flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-2">
            <img src="/chainbill-logo.png" alt="ChainBill" className="h-7 w-7 object-contain shrink-0" />
            <span className="text-[18px] font-bold text-primary truncate">ChainBill</span>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">MSME Growth Engine</p>
        </div>
        <Link href="/supplier/raise-invoice" className="w-full bg-on-surface text-surface py-3 px-4 font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary transition-colors mb-8">
          <span className="material-symbols-outlined">add</span>New Invoice
        </Link>
        <ul className="flex flex-col gap-2 flex-grow">
          {[
            { href: '/supplier/dashboard', icon: 'dashboard', label: 'Dashboard' },
            { href: '/supplier/raise-invoice', icon: 'add_circle', label: 'Raise Invoice' },
            { href: '/supplier/my-invoices', icon: 'description', label: 'My Invoices' },
            { href: '/supplier/credit-history', icon: 'history_edu', label: 'Credit History', active: true },
          ].map(item => (
            <li key={item.href}>
              <Link href={item.href} className={`flex items-center gap-3 py-3 px-4 font-label-md text-label-md transition-colors ${item.active ? 'text-primary font-bold border-r-4 border-primary bg-primary-container/20' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
                <span className="material-symbols-outlined" style={item.active ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-auto pt-6 border-t border-outline-variant/30 flex flex-col gap-3">
          <div className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />BLOCKCHAIN: MOCK ACTIVE
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined text-sm">logout</span>Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 ml-0 md:ml-64 pt-8 px-margin-mobile md:px-margin-desktop pb-section-gap min-h-screen">
        <div className="max-w-6xl mx-auto mb-10">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-4 block">Supplier Portal</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Credit History</h2>
          {session?.user?.email && <p className="text-on-surface-variant text-sm mt-1">{session.user.email}</p>}
        </div>

        {/* Stats grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-section-gap">
          {stats.map(([k, v]) => (
            <BorderGlow
              key={k as string}
              backgroundColor="#fdf9ee"
              borderRadius={4}
              colors={['#c084fc', '#f472b6', '#38bdf8']}
              glowColor="270 50 70"
              glowIntensity={1.0}
              edgeSensitivity={20}
            >
              <div className="p-6 flex flex-col gap-2">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">{k}</span>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{loading ? '—' : v}</span>
              </div>
            </BorderGlow>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mb-10 flex flex-wrap gap-3">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`py-2 px-6 font-label-md text-label-md rounded-full border transition-colors ${filter === f ? 'bg-on-surface text-surface border-on-surface' : 'bg-transparent text-on-surface hover:bg-surface-variant border-outline'}`}>
              {f}
            </button>
          ))}
        </div>

        {loading && page === 0 ? (
          <div className="max-w-4xl mx-auto text-center py-20 text-on-surface-variant">Loading...</div>
        ) : events.length === 0 ? (
          <div className="max-w-4xl mx-auto text-center py-20 text-on-surface-variant flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-5xl">history</span>
            <p>No credit events yet. Raise your first invoice to get started.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-outline-variant/30">
            {events.map(ev => {
              const cfg = ACTION_CONFIG[ev.action] ?? ACTION_CONFIG['CREATED']
              const { date, time } = formatDate(ev.created_at)
              return (
                <div key={ev.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${cfg.color}`}>
                    <span className="material-symbols-outlined text-sm">{cfg.icon}</span>
                  </div>
                  <BorderGlow
                    className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)]"
                    backgroundColor="#fdf9ee"
                    borderRadius={0}
                    colors={ev.action === 'DISPUTED' ? ['#f87171', '#fb923c', '#fbbf24'] : ['#c084fc', '#f472b6', '#38bdf8']}
                    glowColor={ev.action === 'DISPUTED' ? '0 80 60' : '270 50 70'}
                    glowIntensity={1.0}
                    edgeSensitivity={20}
                  >
                    <div className="p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <span className={`font-label-sm text-label-sm px-2 py-1 uppercase tracking-widest ${cfg.badgeCls}`}>{ev.action}</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant text-right">{date}<br />{time}</span>
                      </div>
                      {ev.invoices?.invoice_no && (
                        <div>
                          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Invoice</p>
                          <p className="font-body-lg text-body-lg text-on-surface font-medium">{ev.invoices.invoice_no}</p>
                        </div>
                      )}
                      {ev.invoices?.amount != null && (
                        <div>
                          <p className="font-label-md text-label-md text-on-surface-variant mb-1">Amount</p>
                          <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">₹{ev.invoices.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                        </div>
                      )}
                      <p className="font-label-sm text-label-sm text-on-surface-variant truncate">TX: {ev.tx_hash}</p>
                    </div>
                  </BorderGlow>
                </div>
              )
            })}
          </div>
        )}

        {hasMore && !loading && events.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12 flex justify-center">
            <button onClick={() => setPage(p => p + 1)} className="bg-transparent text-on-surface hover:bg-surface-variant py-3 px-8 font-label-md text-label-md border border-outline uppercase tracking-widest transition-colors flex items-center gap-2">
              Load More <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
