import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // If authenticated but no role yet, send to role-select
    const role = token?.role as string | undefined

    if (pathname.startsWith('/supplier') && role !== 'SUPPLIER')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    if (pathname.startsWith('/buyer') && role !== 'BUYER')
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    if (pathname.startsWith('/investor') && role !== 'INVESTOR')
      return NextResponse.redirect(new URL('/unauthorized', req.url))

    if ((pathname.startsWith('/supplier') || pathname.startsWith('/buyer') || pathname.startsWith('/investor')) && !role)
      return NextResponse.redirect(new URL('/role-select', req.url))

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        const publicPaths = ['/', '/sign-in', '/sign-up', '/unauthorized', '/api/auth']
        if (publicPaths.some(p => pathname.startsWith(p))) return true
        if (pathname.startsWith('/role-select')) return !!token
        if (pathname.startsWith('/api')) return true
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
