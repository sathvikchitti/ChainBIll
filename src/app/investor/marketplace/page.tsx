import { getCurrentUserRole } from '@/lib/getRole'
import { redirect } from 'next/navigation'
import { MarketplaceClient } from './MarketplaceClient'

export const dynamic = 'force-dynamic'

export default async function InvestorMarketplacePage() {
  const role = await getCurrentUserRole()
  if (role !== 'INVESTOR') redirect('/unauthorized')
  return <MarketplaceClient />
}
