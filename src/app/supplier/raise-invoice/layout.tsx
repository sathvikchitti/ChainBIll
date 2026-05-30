import { getCurrentUserRole } from '@/lib/getRole'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RaiseInvoiceLayout({ children }: { children: React.ReactNode }) {
  const role = await getCurrentUserRole()
  if (role !== 'SUPPLIER') redirect('/unauthorized')
  return <>{children}</>
}
