import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/role-select(.*)',
  '/unauthorized(.*)',
  '/api(.*)',
])

const isSupplierRoute = createRouteMatcher(['/supplier(.*)'])
const isBuyerRoute    = createRouteMatcher(['/buyer(.*)'])
const isInvestorRoute = createRouteMatcher(['/investor(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next()

  const session = await auth()
  if (!session.userId) return session.redirectToSignIn()

  let role = (session.sessionClaims as any)?.publicMetadata?.role as string | undefined

  if (!role) {
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(session.userId)
      role = user.publicMetadata?.role as string | undefined
    } catch (e) {
      console.error('Failed to fetch role from Clerk API:', e)
    }
  }

  if (!role) return NextResponse.redirect(new URL('/role-select', req.url))

  if (isSupplierRoute(req) && role !== 'SUPPLIER')
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  if (isBuyerRoute(req) && role !== 'BUYER')
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  if (isInvestorRoute(req) && role !== 'INVESTOR')
    return NextResponse.redirect(new URL('/unauthorized', req.url))

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
