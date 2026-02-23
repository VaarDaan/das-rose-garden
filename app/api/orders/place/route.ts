import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json(
            { error: 'Server configuration error. Contact support.' },
            { status: 500 }
        )
    }

    try {
        const body = await req.json()
        const { items, total, payment_method, address } = body

        if (!items?.length || !total || !address) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // --- 1. Authenticate the user via their Supabase session cookie ---
        const cookieStore = await cookies()
        const anonSupabase = createServerClient(
            supabaseUrl,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { },
                },
            }
        )
        const { data: { user } } = await anonSupabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // --- 2. Use service role client for stock operations (bypasses RLS) ---
        const supabase = createServerClient(supabaseUrl, serviceRoleKey, {
            cookies: { getAll: () => [], setAll: () => { } },
        })

        // --- 3. Atomically decrement stock for each item ---
        for (const item of items) {
            const { data: success, error: rpcError } = await supabase.rpc('decrement_stock', {
                p_product_id: item.product_id,
                p_quantity: item.quantity || 1,
            })

            if (rpcError) {
                return NextResponse.json(
                    { error: `Stock check failed for "${item.name}": ${rpcError.message}` },
                    { status: 500 }
                )
            }

            if (!success) {
                return NextResponse.json(
                    { error: `Insufficient stock for "${item.name}". Please reduce quantity or remove the item.` },
                    { status: 409 }
                )
            }
        }

        // --- 4. Insert the order ---
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                items,
                total,
                status: 'received',
                payment_method: payment_method || 'cod',
                address,
            })
            .select()
            .single()

        if (orderError || !order) {
            // Attempt to rollback stock (best-effort)
            for (const item of items) {
                await supabase.rpc('decrement_stock', {
                    p_product_id: item.product_id,
                    p_quantity: -(item.quantity || 1),
                })
            }
            return NextResponse.json(
                { error: orderError?.message || 'Failed to create order' },
                { status: 500 }
            )
        }

        return NextResponse.json(order)
    } catch (err: any) {
        console.error('[Place Order] Unexpected error:', err)
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}
