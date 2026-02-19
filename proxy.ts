import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If Supabase is not configured yet, allow all requests to pass through
    // This lets developers see the app UI before setting up Supabase
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

        const { data: { user } } = await supabase.auth.getUser()
        const pathname = request.nextUrl.pathname

        // Protect admin routes
        if (pathname.startsWith('/admin')) {
            if (!user) return NextResponse.redirect(new URL('/login', request.url))
            const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '').split(',').map(e => e.trim())
            if (!adminEmails.includes(user.email || '')) return NextResponse.redirect(new URL('/', request.url))
        }

        // Protect auth-gated shop pages
        const protectedPaths = ['/cart', '/checkout', '/orders']
        if (protectedPaths.some((p) => pathname.startsWith(p))) {
            if (!user) return NextResponse.redirect(new URL('/login', request.url))
        }

        return supabaseResponse
    } catch {
        // If anything fails, just pass through
        return NextResponse.next()
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
