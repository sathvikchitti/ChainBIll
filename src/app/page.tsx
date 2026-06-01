import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <nav className="bg-surface dark:bg-surface-dim sticky top-0 border-b border-outline-variant dark:border-outline z-50">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <img src="/chainbill-logo.png" alt="ChainBill Logo" className="h-12 w-12" />
            <a
              className="font-headline-lg text-[24px] font-semibold text-primary dark:text-primary-fixed tracking-tight"
              href="#"
            >
              ChainBill
            </a>
            <div className="hidden md:flex gap-6">
              <a className="font-label-md text-label-md text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed pb-1 hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors duration-200" href="#">
                Solutions
              </a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors duration-200" href="#">
                Platform
              </a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors duration-200" href="#">
                Resources
              </a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim transition-colors duration-200" href="#">
                Pricing
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-up"
              className="hidden md:block font-label-md text-label-md bg-on-surface text-surface px-6 py-3 rounded hover:bg-surface-tint hover:text-on-primary transition-colors duration-200"
            >
              Get Started
            </Link>
            <button className="md:hidden text-on-surface">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-section-gap max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-gutter">
          <div className="w-full lg:w-1/2 flex flex-col gap-stack-gap">
            <h1 className="font-headline-lg-mobile md:font-headline-xl text-headline-lg-mobile md:text-headline-xl text-on-surface">
              Your invoice.<br />
              Your money. <span className="text-primary italic">Now.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md mt-4">
              Blockchain-verified invoice discounting for 63 million MSMEs across India. Secure, fast, and transparent liquidity.
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
                className="font-label-md text-label-md bg-transparent text-on-surface px-8 py-4 rounded hover:bg-surface-container-highest transition-colors duration-200 border border-on-surface"
              >
                Fund Invoices
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end">
            {/* Invoice mockup card */}
            <div className="bg-surface-container-lowest border border-outline p-8 rounded-xl w-full max-w-md relative overflow-hidden">
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
          </div>
        </section>

        {/* Feature Section */}
        <section className="bg-surface-container-low py-section-gap px-margin-mobile md:px-margin-desktop">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">The standard for trust</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Feature Card 1 */}
              <div className="bg-surface-container-lowest border border-outline p-12 rounded-lg flex flex-col gap-6 hover:bg-surface-bright transition-colors duration-300">
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

              {/* Feature Card 2 */}
              <div className="bg-surface-container-lowest border border-outline p-12 rounded-lg flex flex-col gap-6 hover:bg-surface-bright transition-colors duration-300">
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
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container dark:bg-surface-container-high border-t border-outline-variant dark:border-outline mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-12 gap-8 max-w-7xl mx-auto">
          <div className="font-headline-lg text-[24px] font-semibold text-on-surface tracking-tight">
            ChainBill
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">Terms of Service</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">Contact Us</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">Compliance</a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary dark:hover:text-primary-fixed transition-colors duration-200" href="#">Security</a>
          </div>
          <div className="font-body-md text-body-md text-on-surface-variant text-center md:text-right">
            © 2024 ChainBill Technologies Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
