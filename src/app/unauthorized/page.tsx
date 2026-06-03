import { getCurrentUserRole } from '@/lib/getRole'
import UnauthorizedClient from './UnauthorizedClient'

export const dynamic = 'force-dynamic'

export default async function UnauthorizedPage() {
  const role = await getCurrentUserRole()

  const dashboardMap: Record<string, string> = {
    SUPPLIER: '/supplier/dashboard',
    BUYER: '/buyer/pending-confirmations',
    INVESTOR: '/investor/marketplace',
  }
  const dashboardHref = role ? (dashboardMap[role] ?? '/role-select') : '/role-select'

  return <UnauthorizedClient dashboardHref={dashboardHref} />
}
