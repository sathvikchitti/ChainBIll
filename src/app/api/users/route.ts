import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const _session = await getServerSession(authOptions)
    const userEmail = _session?.user?.email
    if (!userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('email', userEmail)
      .single()

    if (userErr || !dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    // Suppliers can only look up buyers; admin can look up anyone
    if (dbUser.role !== 'ADMIN') {
      if (!(dbUser.role === 'SUPPLIER' && role === 'BUYER')) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    let query = supabase
      .from('users')
      .select(`
        id, name, email, role,
        buyer_profiles    ( company_name, credit_score ),
        supplier_profiles ( company_name ),
        investor_profiles ( company_name )
      `)

    if (role) query = query.eq('role', role)

    const { data: users, error } = await query
    if (error) throw error

    return NextResponse.json(users ?? [])
  } catch (err: any) {
    console.error('[GET /api/users]', err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
