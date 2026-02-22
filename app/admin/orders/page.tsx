'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { MessageCircle, ChevronDown, ChevronUp, Truck } from 'lucide-react'

const STATUSES = [
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'packed', label: 'Packed' },
    { value: 'dispatched', label: 'Dispatched to Courier' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
]

const STATUS_COLORS: Record<string, string> = {
    confirmed: 'bg-blue-100 text-blue-700',
    packed: 'bg-orange-100 text-orange-700',
    dispatched: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-green-100 text-green-700',
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [trackingInputs, setTrackingInputs] = useState<Record<string, { tracking_id: string; courier_name: string }>>({})

    const fetchOrders = async () => {
        setLoading(true)
        setError('')
        const res = await fetch('/api/admin/orders')
        if (!res.ok) {
            const err = await res.json()
            setError(err.error || 'Failed to load orders')
            setLoading(false)
            return
        }
        const data = await res.json()
        setOrders(data || [])
        const inputs: typeof trackingInputs = {}
            ; (data || []).forEach((o: any) => {
                inputs[o.id] = { tracking_id: o.tracking_id || '', courier_name: o.courier_name || '' }
            })
        setTrackingInputs(inputs)
        setLoading(false)
    }

    useEffect(() => { fetchOrders() }, [])

    const patchOrder = async (id: string, updates: Record<string, any>) => {
        setUpdatingId(id)
        await fetch('/api/admin/orders', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates }),
        })
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

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    ⚠️ {error}
                    {error.includes('Service role key') && (
                        <p className="mt-1 text-xs">Add <code className="bg-red-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your .env.local and Vercel environment variables.</p>
                    )}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                {loading ? (
                    <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#F5F5F5] rounded-xl animate-pulse" />)}</div>
                ) : orders.length === 0 ? (
                    <div className="py-16 text-center text-sm text-[#767676]">No orders yet</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[750px]">
                            <thead className="bg-[#F5F5F5]">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#767676]">Order</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Customer</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Address</th>
                                    <th className="text-right px-3 py-3 text-xs font-semibold text-[#767676]">Total</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Payment</th>
                                    <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Status</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#767676]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#F5F5F5]">
                                {orders.map((order) => {
                                    const isExpanded = expandedId === order.id
                                    const tracking = trackingInputs[order.id] || { tracking_id: '', courier_name: '' }
                                    return (
                                        <>
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
                                                    <p className="text-xs text-[#767676] max-w-[140px] line-clamp-2">{order.address?.address}, {order.address?.city}</p>
                                                    <p className="text-[10px] text-[#767676]">{order.address?.pincode}</p>
                                                </td>
                                                <td className="px-3 py-3 text-right font-bold text-[#FF6600] text-sm">{formatPrice(order.total)}</td>
                                                <td className="px-3 py-3">
                                                    <span className="text-xs text-[#767676] uppercase font-medium">{order.payment_method}</span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => patchOrder(order.id, { status: e.target.value })}
                                                        disabled={updatingId === order.id}
                                                        className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6600] ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}
                                                    >
                                                        {STATUSES.map((s) => (
                                                            <option key={s.value} value={s.value}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {(order.profiles?.phone || order.address?.phone) && (
                                                            <button onClick={() => openWhatsApp(order.profiles?.phone || order.address?.phone)}
                                                                className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors" title="WhatsApp">
                                                                <MessageCircle size={14} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                            className="p-2 rounded-lg bg-orange-50 text-[#FF6600] hover:bg-orange-100 transition-colors" title="Tracking info">
                                                            {isExpanded ? <ChevronUp size={14} /> : <Truck size={14} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr key={`${order.id}-expand`} className="bg-orange-50/60">
                                                    <td colSpan={7} className="px-6 py-4">
                                                        <p className="text-xs font-bold text-[#FF6600] mb-3 flex items-center gap-1.5">
                                                            <Truck size={13} /> Courier & Tracking Details
                                                        </p>
                                                        <div className="flex flex-wrap items-end gap-3">
                                                            <div>
                                                                <label className="text-[10px] font-semibold text-[#767676] uppercase tracking-wide">Courier Name</label>
                                                                <input value={tracking.courier_name}
                                                                    onChange={e => setTrackingInputs(t => ({ ...t, [order.id]: { ...t[order.id], courier_name: e.target.value } }))}
                                                                    placeholder="e.g. Delhivery, BlueDart"
                                                                    className="mt-1 block bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600] w-56" />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-semibold text-[#767676] uppercase tracking-wide">Tracking ID / AWB</label>
                                                                <input value={tracking.tracking_id}
                                                                    onChange={e => setTrackingInputs(t => ({ ...t, [order.id]: { ...t[order.id], tracking_id: e.target.value } }))}
                                                                    placeholder="e.g. 1234567890"
                                                                    className="mt-1 block bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600] w-56" />
                                                            </div>
                                                            <button
                                                                onClick={() => patchOrder(order.id, {
                                                                    tracking_id: tracking.tracking_id || null,
                                                                    courier_name: tracking.courier_name || null,
                                                                })}
                                                                disabled={updatingId === order.id}
                                                                className="px-4 py-2 bg-[#FF6600] text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60">
                                                                {updatingId === order.id ? 'Saving…' : 'Save Tracking'}
                                                            </button>
                                                        </div>
                                                        {(order.tracking_id || order.courier_name) && (
                                                            <p className="text-xs text-[#767676] mt-2">
                                                                Saved: <span className="font-semibold text-[#2E2E2E]">{order.courier_name || '—'}</span> · <span className="font-mono font-semibold text-[#2E2E2E]">{order.tracking_id || '—'}</span>
                                                            </p>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
