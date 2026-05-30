import { getServerSession } from 'next-auth'
import { authOptions } from './authOptions'
import { supabase } from './supabase'

export async function getSessionUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const { data: dbUser } = await supabase
    .from('users')
    .select('id, role, email, name, onboarded')
    .eq('email', session.user.email)
    .single()

  return dbUser ?? null
}

export async function getSessionEmail(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.email ?? null
}
