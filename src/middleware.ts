import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Clone the response
  const response = NextResponse.next()

  // Add Permissions Policy headers to prevent console warnings
  response.headers.set('Permissions-Policy', [
    'browsing-topics=()',
    'run-ad-auction=()',
    'join-ad-interest-group=()',
    'private-state-token-redemption=()',
    'private-state-token-issuance=()',
    'private-aggregation=()',
    'attribution-reporting=()'
  ].join(', '))

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}