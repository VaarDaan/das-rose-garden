import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!url || url.includes('YOUR_SUPABASE') || !key) {
    // Return a mock client that fails gracefully when not configured
    // This prevents crashes during development without Supabase configured
    console.warn('[Rose Garden] Supabase not configured. Add credentials to .env.local')
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key'
    )
  }

  return createBrowserClient(url, key)
}
