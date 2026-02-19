'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Flower2, ChevronRight, Package } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
    confirmed: 'Confirmed',
    processed: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
}

const STATUS_COLORS: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    processed: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            setOrders(data as Order[] || [])
            setLoading(false)
        }
        fetchOrders()
    }, [])

    if (loading) {
        return (
            <div className="px-4 py-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-xl bg-[#F5F5F5] animate-pulse" />
                ))}
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-5">
                    <Package size={40} className="text-[#FF6600] opacity-60" />
                </div>
                <h2 className="text-xl font-bold text-[#2E2E2E] mb-2">No orders yet</h2>
                <p className="text-sm text-[#767676] mb-6">Your orders will appear here</p>
                <Link href="/categories" className="btn-primary">Start Shopping</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <div className="bg-white px-4 py-3 border-b border-[#E8E8E8]">
                <h1 className="text-lg font-bold text-[#2E2E2E]">My Orders</h1>
            </div>
            <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
                {orders.map((order) => (
                    <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="card bg-white p-4 flex gap-3 items-center"
                    >
                        {/* First product image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#F9F0EC] shrink-0">
                            {order.items[0]?.image ? (
                                <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Flower2 size={24} className="text-[#FF6600] opacity-30" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#767676] mb-1">
                                #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-sm font-semibold text-[#2E2E2E] line-clamp-1">
                                {order.items.map((i) => i.name).join(', ')}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                                <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {STATUS_LABELS[order.status] || order.status}
                                </span>
                                <span className="text-sm font-bold text-[#FF6600]">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-[#767676] shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    )
}
