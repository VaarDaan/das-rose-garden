import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createHmac } from 'crypto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
// Service role key bypasses all RLS — never expose this to the browser
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function verifyAdminSession(cookieStore: ReturnType<typeof cookies> extends Promise<infer T> ? T : never) {
    const token = cookieStore.get('drg_admin_session')?.value
    if (!token) return false
    try {
        const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret'
        const lastDot = token.lastIndexOf('.')
        if (lastDot === -1) return false
        const payload = token.slice(0, lastDot)
        const sig = token.slice(lastDot + 1)
        const expectedSig = createHmac('sha256', secret).update(payload).digest('hex')
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

export async function GET() {
    const cookieStore = await cookies()
    const isAdmin = await verifyAdminSession(cookieStore)
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    // Service role client bypasses RLS entirely
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        cookies: { getAll: () => [], setAll: () => { } },
    })

    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function PATCH(req: Request) {
    const cookieStore = await cookies()
    const isAdmin = await verifyAdminSession(cookieStore)
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        cookies: { getAll: () => [], setAll: () => { } },
    })

    const { id, ...updates } = await req.json()
    const { error } = await supabase.from('orders').update(updates).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
