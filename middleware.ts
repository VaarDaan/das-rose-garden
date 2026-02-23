import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()

    // Content-Security-Policy: allow own domain + Google Fonts
    response.headers.set(
        'Content-Security-Policy',
        [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: blob: https://*.supabase.co",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
            "frame-ancestors 'none'",
        ].join('; ')
    )

    // Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY')

    // Prevent MIME-type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff')

    // Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Disable sensitive device APIs
    response.headers.set(
        'Permissions-Policy',
        'geolocation=(), camera=(), microphone=()'
    )

    return response
}

// Apply to all routes except static files and Next.js internals
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
