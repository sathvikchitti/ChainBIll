'use client'

import { useSession, signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BorderGlow from '@/components/BorderGlow'

const roles = [
  {
    id: 'SUPPLIER',
    icon: 'factory',
    label: 'SUPPLIER',
    desc: 'Raise invoices and get early payment at competitive rates.',
    badge: '1.4% / month',
  },
  {
    id: 'BUYER',
    icon: 'shopping_cart',
    label: 'BUYER',
    desc: 'Confirm invoices from your suppliers on the blockchain.',
    badge: 'Free to use',
  },
  {
    id: 'INVESTOR',
    icon: 'trending_up',
    label: 'INVESTOR',
    desc: 'Fund verified invoices and earn returns of ~16.8% PA.',
    badge: '~16.8% PA returns',
  },
]

export default function RoleSelectPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!selected || !session?.user?.email) return
    setLoading(true)
    setError(null)
    try {
      const companyName =
        session.user.name ?? session.user.email.split('@')[0] ?? 'My Company'

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selected, companyName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Onboarding failed')

      // Force JWT refresh so middleware sees the new role immediately
      // Wait for JWT to be reissued with new role before navigating
      await update()
      await new Promise(resolve => setTimeout(resolve, 800))

      router.push(data.redirect)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop text-on-surface">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <div className="text-center mb-section-gap max-w-2xl">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight mb-8">
            <span className="flex items-center justify-center gap-3"><img src="/chainbill-logo.png" alt="ChainBill" className="h-10 w-10 object-contain" />ChainBill</span>
          </h1>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-gap">
            Choose Your Role
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Select how you&apos;ll use ChainBill. This cannot be changed later.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter w-full mb-section-gap">
          {roles.map(role => {
            const active = selected === role.id
            return (
              <BorderGlow
                key={role.id}
                backgroundColor="#fdf9ee"
                borderRadius={4}
                colors={['#c084fc', '#f472b6', '#38bdf8']}
                glowColor="270 50 70"
                glowIntensity={active ? 1.5 : 1.0}
                edgeSensitivity={15}
                className={active ? 'ring-2 ring-primary' : ''}
              >
              <button
                onClick={() => setSelected(role.id)}
                className={`flex flex-col items-start p-8 text-left transition-colors duration-300 relative w-full ${
                  active
                    ? 'bg-primary-container/10'
                    : 'bg-transparent hover:bg-surface-container-low'
                }`}
              >
                {active && (
                  <div className="absolute top-4 right-4 text-primary">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                )}
                <span className="material-symbols-outlined text-[48px] text-primary mb-6">{role.icon}</span>
                <h3 className="font-label-md text-label-md text-on-surface mb-4 uppercase">{role.label}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 flex-grow">{role.desc}</p>
                <span className={`inline-block font-label-sm text-label-sm px-3 py-1 border ${active ? 'bg-primary-container/20 text-primary border-primary/20' : 'bg-surface-variant text-on-surface-variant border-outline-variant'}`}>
                  {role.badge}
                </span>
              </button>
              </BorderGlow>
            )
          })}
        </div>

        {error && (
          <p className="font-label-sm text-label-sm text-error mb-4 uppercase tracking-wider">{error}</p>
        )}

        <div className="w-full max-w-sm">
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className="w-full bg-on-surface text-on-primary font-label-md text-label-md py-4 px-6 hover:bg-primary transition-colors duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Setting up your account...
              </>
            ) : (
              <>
                Continue
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  )
}
