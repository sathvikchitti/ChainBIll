import { getCurrentUserRole } from '@/lib/getRole'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'

export const dynamic = 'force-dynamic'

export default async function RoleSelectLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/sign-in')

  const role = await getCurrentUserRole()
  const dashboardMap: Record<string, string> = {
    SUPPLIER: '/supplier/dashboard',
    BUYER: '/buyer/pending-confirmations',
    INVESTOR: '/investor/marketplace',
  }
  if (role && dashboardMap[role]) redirect(dashboardMap[role])

  return <>{children}</>
}
