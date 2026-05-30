import { getCurrentUserRole } from '@/lib/getRole'
import { redirect } from 'next/navigation'
import { PendingConfirmationsClient } from './PendingConfirmationsClient'

export const dynamic = 'force-dynamic'

export default async function BuyerPendingConfirmationsPage() {
  const role = await getCurrentUserRole()
  if (role !== 'BUYER') redirect('/unauthorized')
  return <PendingConfirmationsClient />
}
