'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Flower2, ChevronRight, Package } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
    received: 'Order Received',
    confirmed: 'Confirmed',
    packed: 'Packed',
    dispatched: 'Dispatched',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
    received: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    packed: 'bg-[#6B7A41]/10 text-[#6B7A41]',
    dispatched: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
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
                    <div key={i} className="h-28 rounded-xl bg-[#F9F6EE] animate-pulse" />
                ))}
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 rounded-full bg-[#F9F6EE] flex items-center justify-center mb-5">
                    <Package size={40} className="text-[#6B7A41] opacity-60" />
                </div>
                <h2 className="text-xl font-bold text-[#2C331F] mb-2">No orders yet</h2>
                <p className="text-sm text-[#595959] mb-6">Your orders will appear here</p>
                <Link href="/categories" className="btn-primary">Start Shopping</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDECEF]">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-[#D9D4CA]/60">
                <h1 className="text-xl font-bold text-[#2C331F]">My Orders</h1>
            </div>
            <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
                {orders.map((order) => (
                    <Link
                        key={order.id}
                        href={`/orders/${order.id}`}
                        className="bg-[#F9F6EE] rounded-xl p-4 flex gap-3 items-center border border-[#E8E4D9]/60 shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* First product image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#F0ECE2] shrink-0">
                            {order.items[0]?.image ? (
                                <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Flower2 size={24} className="text-[#6B7A41] opacity-30" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#595959] mb-1">
                                #DRG{String(order.order_number).padStart(5, '0')} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-sm font-semibold text-[#2C331F] line-clamp-1">
                                {order.items.map((i) => i.name).join(', ')}
                            </p>
                            <div className="flex items-center justify-between mt-1.5">
                                <span className={`badge ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                    {STATUS_LABELS[order.status] || order.status}
                                </span>
                                <span className="text-sm font-bold text-[#6B7A41]">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-[#595959] shrink-0" />
                    </Link>
                ))}
            </div>
        </div>
    )
}
