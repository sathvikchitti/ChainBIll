import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return new NextResponse('Unauthorized', { status: 401 })

    const email = session.user.email
    const body = await req.json()
    const { role, companyName } = body

    if (!role || !companyName) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    const validRoles = ['SUPPLIER', 'BUYER', 'INVESTOR']
    const upperRole = role.toUpperCase()
    if (!validRoles.includes(upperRole)) {
      return new NextResponse('Invalid role', { status: 400 })
    }

    const name = session.user.name ?? email.split('@')[0]

    // Upsert user row
    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .upsert(
        { email, name, role: upperRole, onboarded: true },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (userErr || !dbUser) {
      console.error('[onboarding] upsert user:', userErr)
      return new NextResponse('DB error', { status: 500 })
    }

    // Upsert role-specific profile
    if (upperRole === 'SUPPLIER') {
      await supabase
        .from('supplier_profiles')
        .upsert({ user_id: dbUser.id, company_name: companyName }, { onConflict: 'user_id' })
    } else if (upperRole === 'BUYER') {
      await supabase
        .from('buyer_profiles')
        .upsert(
          { user_id: dbUser.id, company_name: companyName, credit_score: 750 },
          { onConflict: 'user_id' }
        )
    } else if (upperRole === 'INVESTOR') {
      await supabase
        .from('investor_profiles')
        .upsert({ user_id: dbUser.id, company_name: companyName }, { onConflict: 'user_id' })
    }

    const dashboardMap: Record<string, string> = {
      SUPPLIER: '/supplier/dashboard',
      BUYER: '/buyer/pending-confirmations',
      INVESTOR: '/investor/marketplace',
    }

    return NextResponse.json({ success: true, redirect: dashboardMap[upperRole] })
  } catch (err) {
    console.error('[ONBOARDING_ERROR]', err)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
