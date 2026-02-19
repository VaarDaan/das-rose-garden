'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { MessageCircle } from 'lucide-react'

const STATUSES = ['confirmed', 'processed', 'shipped', 'delivered']

const STATUS_COLORS: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    processed: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const supabase = createClient()

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*, profiles(full_name, phone)')
            .order('created_at', { ascending: false })
        setOrders(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchOrders() }, [])

    const updateStatus = async (id: string, status: string) => {
        setUpdatingId(id)
        await supabase.from('orders').update({ status }).eq('id', id)
        await fetchOrders()
        setUpdatingId(null)
    }

    const openWhatsApp = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '')
        const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`
        window.open(`https://wa.me/${number}`, '_blank')
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#2E2E2E]">Orders</h1>
                <p className="text-sm text-[#767676]">{orders.length} total orders</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                {loading ? (
                    <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#F5F5F5] rounded-xl animate-pulse" />)}</div>
                ) : orders.length === 0 ? (
                    <div className="py-16 text-center text-sm text-[#767676]">No orders yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[700px]">
                            <thead className="bg-[#F5F5F5]">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#767676]">Order</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Customer</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Address</th>
                                    <th className="text-right px-3 py-3 text-xs font-semibold text-[#767676]">Total</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Payment</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Status</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#767676]">Contact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5F5F5]">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#FAFAFA]">
                                        <td className="px-4 py-3">
                                            <p className="font-mono text-xs text-[#2E2E2E] font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            <p className="text-[10px] text-[#767676]">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="font-medium text-[#2E2E2E] text-xs">{order.profiles?.full_name || order.address?.full_name || '—'}</p>
                                            <p className="text-[10px] text-[#767676]">{order.profiles?.phone || order.address?.phone}</p>
                                        </td>
                                        <td className="px-3 py-3">
                                            <p className="text-xs text-[#767676] max-w-[140px] line-clamp-2">
                                                {order.address?.address}, {order.address?.city}
                                            </p>
                                            <p className="text-[10px] text-[#767676]">{order.address?.pincode}</p>
                                        </td>
                                        <td className="px-3 py-3 text-right font-bold text-[#FF6600] text-sm">
                                            {formatPrice(order.total)}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className="text-xs text-[#767676] uppercase font-medium">{order.payment_method}</span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <select
                                                value={order.status}
                                                onChange={(e) => updateStatus(order.id, e.target.value)}
                                                disabled={updatingId === order.id}
                                                className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6600] ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {(order.profiles?.phone || order.address?.phone) && (
                                                <button
                                                    onClick={() => openWhatsApp(order.profiles?.phone || order.address?.phone)}
                                                    className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                                                    title="WhatsApp"
                                                >
                                                    <MessageCircle size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
