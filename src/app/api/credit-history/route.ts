import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 })

    const { searchParams } = new URL(req.url)
    const filter = searchParams.get('filter') ?? 'ALL'
    const offset = parseInt(searchParams.get('offset') ?? '0')
    const limit = parseInt(searchParams.get('limit') ?? '10')

    // Get user id from email
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!user) return new NextResponse('User not found', { status: 404 })

    let query = supabase
      .from('audit_trail')
      .select('id, action, created_at, tx_hash, metadata, invoices(invoice_no, amount)')
      .eq('actor_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filter !== 'ALL') {
      query = query.eq('action', filter)
    }

    const { data, error } = await query

    if (error) {
      console.error('[credit-history]', error)
      return new NextResponse('DB error', { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    console.error('[credit-history]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}
