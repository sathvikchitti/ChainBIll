import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'No session', session: null })
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, email, role, onboarded')
    .eq('email', session.user.email)
    .single()

  return NextResponse.json({
    sessionEmail: session.user.email,
    sessionRole: (session.user as any).role,
    dbUser: user,
    dbError: error,
    serviceKeySet: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    serviceKeyPrefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 20) ?? 'NOT SET',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'NOT SET',
  })
}
