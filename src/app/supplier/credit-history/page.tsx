import { getCurrentUserRole } from '@/lib/getRole'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SupplierCreditHistoryPage() {
  const role = await getCurrentUserRole()
  if (role !== 'SUPPLIER') redirect('/unauthorized')

  return (
    <div className="bg-background text-on-background min-h-screen antialiased flex">
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container dark:bg-surface-dim border-r border-outline-variant py-8 px-6 z-50">
        <div className="mb-8 flex flex-col gap-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-4xl text-primary">currency_exchange</span>
            <h1 className="font-headline-lg text-headline-lg-mobile text-primary tracking-tight">ChainBill</h1>
          </div>
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">MSME Growth Engine</p>
        </div>
        <button
          type="button"
          className="w-full bg-on-surface text-surface py-3 px-4 font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-primary transition-colors duration-200 ease-in-out mb-8"
        >
          <span className="material-symbols-outlined">add</span>
          New Invoice
        </button>
        <ul className="flex flex-col gap-2 flex-grow">
          <li>
            <Link
              href="/supplier/dashboard"
              className="flex items-center gap-3 py-3 px-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/supplier/raise-invoice"
              className="flex items-center gap-3 py-3 px-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">add_circle</span>
              Raise Invoice
            </Link>
          </li>
          <li>
            <Link
              href="/supplier/my-invoices"
              className="flex items-center gap-3 py-3 px-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined">description</span>
              My Invoices
            </Link>
          </li>
          <li>
            <Link
              href="/supplier/credit-history"
              className="flex items-center gap-3 py-3 px-4 text-primary font-bold border-r-4 border-primary bg-primary-container/20 transition-colors duration-200 ease-in-out"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                history_edu
              </span>
              Credit History
            </Link>
          </li>
          <li>
            <a className="flex items-center gap-3 py-3 px-4 font-label-md text-label-md text-on-surface-variant hover:bg-surface-variant transition-colors duration-200 ease-in-out" href="#">
              <span className="material-symbols-outlined">settings</span>
              Settings
            </a>
          </li>
        </ul>
        <div className="mt-auto pt-6 border-t border-outline-variant/30 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          BLOCKCHAIN: MOCK ACTIVE
        </div>
      </nav>

      <header className="md:hidden flex justify-between items-center h-20 px-margin-mobile bg-background border-b border-outline-variant fixed w-full top-0 z-40">
        <h1 className="text-headline-lg-mobile font-headline-lg-mobile text-on-surface">ChainBill</h1>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary">notifications</span>
          <span className="material-symbols-outlined text-primary">account_circle</span>
        </div>
      </header>

      <main className="flex-1 ml-0 md:ml-64 pt-24 md:pt-16 px-margin-mobile md:px-margin-desktop pb-section-gap min-h-screen">
        <div className="max-w-6xl mx-auto mb-16">
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary mb-4 block">Supplier Portal</span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Credit History</h2>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-section-gap">
          {[
            ['Total Events', '1,204'],
            ['Invoices Raised', '342'],
            ['Funded Count', '289'],
            ['Settled Count', '275'],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col gap-2">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">{k}</span>
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{v}</span>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mb-16 flex flex-wrap gap-3">
          {['ALL', 'RAISES', 'CONFIRMATIONS', 'FUNDINGS', 'SETTLEMENTS', 'DISPUTES'].map((f, i) => (
            <button
              key={f}
              type="button"
              className={`py-2 px-6 font-label-md text-label-md rounded-full border transition-colors ${
                i === 0
                  ? 'bg-on-surface text-surface border-on-surface'
                  : 'bg-transparent text-on-surface hover:bg-surface-variant border-outline'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-outline-variant/30">
          {[
            { id: 'ev-settled', icon: 'check_circle', badge: 'SETTLED', badgeCls: 'bg-surface-container-high text-on-surface', amount: '₹45,000.00' },
            { id: 'ev-funded', icon: 'account_balance_wallet', badge: 'FUNDED', badgeCls: 'bg-tertiary/10 text-tertiary border border-tertiary/20', amount: '₹45,000.00' },
            { id: 'ev-disputed', icon: 'warning', badge: 'DISPUTED', badgeCls: 'bg-error-container text-on-error-container border border-error/20', amount: '₹12,500.00', disputed: true },
            { id: 'ev-created', icon: 'add_circle', badge: 'CREATED', badgeCls: 'bg-primary-container text-on-primary-container border border-primary/20', amount: '₹45,000.00' },
          ].map((ev) => (
            <div
              key={ev.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mb-8"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                  ev.badge === 'DISPUTED' ? 'bg-error text-on-error' : ev.badge === 'FUNDED' ? 'bg-tertiary text-on-tertiary' : ev.badge === 'CREATED' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{ev.icon}</span>
              </div>
              <div
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-surface-container-lowest border p-6 rounded-lg flex flex-col gap-4 ${
                  ev.disputed ? 'border-error/50' : 'border-outline-variant'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className={`font-label-sm text-label-sm px-2 py-1 rounded-sm uppercase tracking-widest ${ev.badgeCls}`}>{ev.badge}</span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant text-right">
                    12 Jan 2025
                    <br />3:42 PM
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Invoice ID</p>
                  <p className="font-body-lg text-body-lg text-on-surface font-medium truncate">INV-2025-0042</p>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Amount</p>
                  <p className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">{ev.amount}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 flex justify-center">
          <button
            type="button"
            className="bg-transparent text-on-surface hover:bg-surface-variant py-3 px-8 font-label-md text-label-md border border-outline uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            Load More
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </main>
    </div>
  )
}
