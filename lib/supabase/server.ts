import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const cookieStore = await cookies()

    const supabaseUrl = (!url || url.includes('YOUR_SUPABASE'))
        ? 'https://placeholder.supabase.co'
        : url
    const supabaseKey = (!key || key.includes('YOUR_SUPABASE'))
        ? 'placeholder-key'
        : key

    return createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore — called from Server Component
                    }
                },
            },
        }
    )
}
