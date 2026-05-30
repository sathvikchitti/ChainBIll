import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

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

    // Get user info from Clerk
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
    const name =
      `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() ||
      email.split('@')[0]

    // Upsert user row
    // Upsert user row
    console.log('[onboarding] supabase url:', process.env.NEXT_PUBLIC_SUPABASE_URL)

    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .upsert(
        { clerk_id: userId, email, name, role: upperRole, onboarded: true },
        { onConflict: 'clerk_id' }
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

    // Update Clerk public metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role: upperRole, onboarded: true },
    })

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
