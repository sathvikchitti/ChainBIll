import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('clerk_id', userId)
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
