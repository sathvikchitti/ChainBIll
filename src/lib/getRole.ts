import { getServerSession } from 'next-auth'
import { authOptions } from './authOptions'
import { supabase } from './supabase'

export async function getCurrentUserRole(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('email', session.user.email)
    .single()

  return user?.role ?? null
}
