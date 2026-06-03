import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseAdmin } from '@/lib/supabase'
import { getCurrentUserRole } from '@/lib/getRole'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No session' })
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, role, onboarded')
    .eq('email', session.user.email)
    .single()

  const roleFromGetRole = await getCurrentUserRole()

  return NextResponse.json({
    sessionEmail: session.user.email,
    sessionRole: (session.user as any).role,
    roleFromGetRole,
    dbUser: user,
    dbError: error?.message ?? null,
    serviceKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) ?? 'NOT SET',
  })
}
