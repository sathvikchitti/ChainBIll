import Link from 'next/link'
import PillNav from '@/components/PillNav'
import BorderGlow from '@/components/BorderGlow'
import DitherBackground from '@/components/DitherBackground'
import ShinyText from '@/components/ShinyText'

export default function Home() {
  return (
    <div className="text-on-surface antialiased min-h-screen flex flex-col" style={{ backgroundColor: '#fdf9ee' }}>

      {/* Dither — fixed full-page background */}
      <DitherBackground />

      {/* PillNav */}
      <PillNav
        logo="/chainbill-logo.png"
        logoAlt="ChainBill Logo"
        items={[
          { label: 'Home', href: '/' },
          { label: 'Pricing', href: '#pricing' },
          { label: 'Get Started', href: '/sign-up' },
        ]}
        activeHref="/"
        ctaLabel="Sign up"
        ctaHref="/sign-up"
      />

      {/* Main Content — relative z-10 so it sits above the fixed canvas */}
      <main className="flex-grow relative z-10">

        {/* ── Hero Section ── */}
        <section className="px-margin-mobile md:px-margin-desktop py-section-gap max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-gutter">
          <div className="w-full lg:w-1/2 flex flex-col gap-stack-gap">
            <h1 className="font-headline-lg-mobile md:font-headline-xl text-headline-lg-mobile md:text-headline-xl">
              <ShinyText
                text="Your invoice. Your money."
                color="#1c1c15"
                shineColor="#a78bfa"
                speed={4}
                delay={0}
                spread={100}
              />{' '}
              <ShinyText
                text="Now."
                color="#a78bfa"
                shineColor="#ffffff"
                speed={3}
                delay={0}
                spread={100}
                className="italic"
              />
            </h1>
            <p className="font-body-lg text-body-lg max-w-md mt-4">
              <ShinyText
                text="Blockchain-verified invoice discounting for 63 million MSMEs across India. Secure, fast, and transparent liquidity."
                color="#4a4550"
                shineColor="#c4b5fd"
                speed={6}
                delay={0}
                spread={110}
              />
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link
                href="/sign-up"
                className="font-label-md text-label-md bg-on-surface text-surface px-8 py-4 rounded hover:bg-primary hover:text-on-primary transition-colors duration-200 border border-on-surface"
              >
                Raise an Invoice
              </Link>
              <Link
                href="/sign-up"
                className="font-label-md text-label-md text-on-surface px-8 py-4 rounded hover:bg-surface-container-highest transition-colors duration-200 border border-on-surface"
                style={{ backgroundColor: 'rgba(253,249,238,0.75)', backdropFilter: 'blur(4px)' }}
              >
                Fund Invoices
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end">
            {/* Invoice mockup card */}
            <BorderGlow
              className="w-full max-w-md"
              backgroundColor="#fdf9ee"
              borderRadius={12}
              colors={['#c084fc', '#f472b6', '#38bdf8']}
              glowColor="270 50 70"
              glowIntensity={1.2}
              edgeSensitivity={20}
            >
              <div className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-primary-container text-on-primary-container px-3 py-1 rounded font-label-sm text-label-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      verified_user
                    </span>
                    BLOCKCHAIN VERIFIED
                  </div>
                </div>
                <div className="mb-8 mt-4">
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Invoice Total</p>
                  <p className="font-headline-lg text-headline-lg text-on-surface">₹12,00,000</p>
                </div>
                <div className="space-y-4 border-t border-outline-variant pt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Due Date</span>
                    <span className="font-label-md text-label-md text-on-surface">Oct 24, 2024</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Buyer</span>
                    <span className="font-label-md text-label-md text-on-surface">Acme Corp India</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Discount Rate</span>
                    <span className="font-label-md text-label-md text-on-surface">1.2% / month</span>
                  </div>
                </div>
                <div className="mt-8">
                  <button className="w-full font-label-md text-label-md bg-surface-variant text-on-surface-variant px-4 py-3 rounded flex justify-center items-center gap-2 hover:bg-outline-variant transition-colors">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                    Fund This Invoice
                  </button>
                </div>
              </div>
            </BorderGlow>
          </div>
        </section>

        {/* ── Feature Section — no background, fully transparent so PixelBlast shows through ── */}
        <section className="py-section-gap px-margin-mobile md:px-margin-desktop">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg">
                <ShinyText
                  text="The standard for trust"
                  color="#1c1c15"
                  shineColor="#a78bfa"
                  speed={5}
                  delay={0}
                  spread={100}
                />
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">

              {/* Feature Card 1 */}
              <BorderGlow
                className="flex flex-col gap-6"
                backgroundColor="#fdf9ee"
                borderRadius={8}
                colors={['#c084fc', '#f472b6', '#38bdf8']}
                glowColor="270 50 70"
                glowIntensity={1.2}
                edgeSensitivity={20}
              >
                <div className="p-12 flex flex-col gap-6">
                  <div className="w-16 h-16 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed mb-4">
                    <span className="material-symbols-outlined text-[32px]">speed</span>
                  </div>
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Capital in 24 Hours</h3>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Unlock working capital instantly. Our automated smart contracts process verified invoices and disburse funds directly to your account within 24 hours of approval.
                  </p>
                  <a className="font-label-md text-label-md text-primary mt-auto flex items-center gap-2 hover:text-on-primary-fixed-variant w-fit" href="#">
                    Learn about liquidity
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </BorderGlow>

              {/* Feature Card 2 */}
              <BorderGlow
                className="flex flex-col gap-6"
                backgroundColor="#fdf9ee"
                borderRadius={8}
                colors={['#c084fc', '#f472b6', '#38bdf8']}
                glowColor="270 50 70"
                glowIntensity={1.2}
                edgeSensitivity={20}
              >
                <div className="p-12 flex flex-col gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container mb-4">
                    <span className="material-symbols-outlined text-[32px]">link</span>
                  </div>
                  <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Immutable Records</h3>
                  <p className="font-body-lg text-body-lg text-on-surface-variant">
                    Every invoice is cryptographically secured on the blockchain. Eliminate fraud, ensure transparency for financiers, and build an unbreakable credit history.
                  </p>
                  <a className="font-label-md text-label-md text-primary mt-auto flex items-center gap-2 hover:text-on-primary-fixed-variant w-fit" href="#">
                    Explore our security
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>
              </BorderGlow>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant mt-auto relative z-10" style={{ backgroundColor: 'rgba(253, 249, 238, 0.85)', backdropFilter: 'blur(8px)' }}>
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 gap-8 max-w-7xl mx-auto">
          <div className="font-headline-lg text-[24px] font-semibold text-on-surface tracking-tight">
            ChainBill
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Contact Us</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Compliance</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors duration-200" href="#">Security</a>
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant text-center md:text-right">
            © 2026 ChainBill Technologies Private Limited. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
