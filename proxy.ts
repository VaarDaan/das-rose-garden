import { NextResponse, type NextRequest } from 'next/server'

// ─── Admin session cookie helpers ─────────────────────────────────────────────
const SESSION_COOKIE = 'drg_admin_session'

async function verifyAdminSession(token: string): Promise<boolean> {
    try {
        const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret'
        const lastDot = token.lastIndexOf('.')
        if (lastDot === -1) return false

        const payload = token.slice(0, lastDot)
        const sig = token.slice(lastDot + 1)

        // Use Web Crypto API (available in Edge Runtime)
        const encoder = new TextEncoder()
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign', 'verify']
        )
        const signatureBuffer = await crypto.subtle.sign(
            'HMAC',
            keyMaterial,
            encoder.encode(payload)
        )
        const expectedSig = Array.from(new Uint8Array(signatureBuffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('')

        // Constant-time comparison
        if (sig.length !== expectedSig.length) return false
        let diff = 0
        for (let i = 0; i < sig.length; i++) {
            diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i)
        }
        return diff === 0
    } catch {
        return false
    }
}

// ─── Main proxy function ───────────────────────────────────────────────────────
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // ── Admin route protection ──────────────────────────────────────────────
    if (pathname.startsWith('/admin')) {
        if (!pathname.startsWith('/admin/login')) {
            // Protected admin page — require valid session cookie
            const token = request.cookies.get(SESSION_COOKIE)?.value
            if (!token || !(await verifyAdminSession(token))) {
                const loginUrl = new URL('/admin/login', request.url)
                loginUrl.searchParams.set('next', pathname)
                return NextResponse.redirect(loginUrl)
            }
        } else {
            // Already logged in? Redirect to /admin
            const token = request.cookies.get(SESSION_COOKIE)?.value
            if (token && (await verifyAdminSession(token))) {
                return NextResponse.redirect(new URL('/admin', request.url))
            }
        }
        // Admin routes don't need Supabase session refresh — return here
        return NextResponse.next()
    }

    // ── Supabase session refresh for all other routes ───────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL' || !supabaseAnonKey) {
        return NextResponse.next()
    }

    try {
        const { createServerClient } = await import('@supabase/ssr')
        let supabaseResponse = NextResponse.next({ request })

        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        })

        await supabase.auth.getUser()

        const protectedPaths = ['/cart', '/checkout', '/orders']
        if (protectedPaths.some((p) => pathname.startsWith(p))) {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return NextResponse.redirect(new URL('/login', request.url))
        }

        return supabaseResponse
    } catch {
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
