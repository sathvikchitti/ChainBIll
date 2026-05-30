import { getCurrentUserRole } from '@/lib/getRole'
import { redirect } from 'next/navigation'
import { SupplierDashboardClient } from './SupplierDashboardClient'

export const dynamic = 'force-dynamic'

export default async function SupplierDashboardPage() {
  const role = await getCurrentUserRole()
  if (role !== 'SUPPLIER') redirect('/unauthorized')
  return <SupplierDashboardClient />
}
