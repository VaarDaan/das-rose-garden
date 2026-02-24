import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createHmac } from 'crypto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
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

export async function POST(req: Request) {
    const cookieStore = await cookies()
    const isAdmin = await verifyAdminSession(cookieStore)
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
    }

    const supabase = createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        cookies: { getAll: () => [], setAll: () => { } },
    })

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File | null
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 })
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
        }

        // Generate unique filename
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 8)
        const fileName = `products/${timestamp}-${random}.${ext}`

        // Read file into buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('images')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: false,
            })

        if (error) {
            console.error('Supabase storage upload error:', error)
            return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
        }

        // Get the public URL
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(data.path)

        return NextResponse.json({ url: urlData.publicUrl })
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
    }
}
