'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function UnauthorizedPage() {
  const { data: session } = useSession()

  // We don't have role in session directly, just send them to role-select
  const dashboardHref = '/role-select'

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col justify-between">
      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-section-gap w-full max-w-7xl mx-auto">
        <div className="max-w-2xl text-center flex flex-col items-center">
          <div className="mb-8">
            <span
              className="material-symbols-outlined text-[80px] text-outline-variant"
              style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}
            >
              lock
            </span>
          </div>
          <p className="font-label-sm text-label-sm text-outline uppercase tracking-[0.1em] mb-4">
            You don&apos;t have permission to view this page
          </p>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-6">
            Access Restricted
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto mb-12">
            Your account role does not permit access to this section of ChainBill.
            Please navigate to your assigned portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-stack-gap items-center justify-center">
            <Link
              href={dashboardHref}
              className="inline-flex items-center justify-center px-8 py-4 bg-on-surface text-surface font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors duration-200"
            >
              Go to My Dashboard
              <span className="material-symbols-outlined ml-2 text-[16px]">arrow_forward</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-on-surface border border-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
      <footer className="w-full py-8 text-center border-t border-surface-variant">
        <p className="font-label-sm text-label-sm text-tertiary">ChainBill · Blockchain Invoice Discounting</p>
      </footer>
    </div>
  )
}
