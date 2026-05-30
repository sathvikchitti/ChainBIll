import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="text-primary tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 700 }}>ChainBill</h1>
        <p className="text-on-surface-variant mt-2" style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: '16px' }}>Blockchain Invoice Discounting</p>
      </div>
      <SignIn forceRedirectUrl="/role-select" />
    </main>
  )
}
