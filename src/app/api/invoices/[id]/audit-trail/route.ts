import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'

type RouteProps = { params: Promise<{ id: string }> }

export async function GET(_req: Request, props: RouteProps) {
  try {
    const { id } = await props.params

    const { data: trail, error } = await supabase
      .from('audit_trail')
      .select(`
        *,
        actor:actor_id ( name, email, role )
      `)
      .eq('invoice_id', id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json(trail ?? [])
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch audit trail' }, { status: 500 })
  }
}
