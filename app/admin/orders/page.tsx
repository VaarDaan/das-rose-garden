'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import {
    MessageCircle, ChevronDown, ChevronUp, Truck,
    Package, User, MapPin, Calendar, CreditCard, Hash
} from 'lucide-react'

const STATUSES = [
    { value: 'received', label: 'Order Received' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'packed', label: 'Packed' },
    { value: 'dispatched', label: 'Dispatched to Courier' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
    received: 'bg-gray-100 text-gray-700 border-gray-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    packed: 'bg-orange-50 text-orange-700 border-orange-200',
    dispatched: 'bg-purple-50 text-purple-700 border-purple-200',
    out_for_delivery: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_DOT: Record<string, string> = {
    received: 'bg-gray-400',
    confirmed: 'bg-blue-500',
    packed: 'bg-orange-500',
    dispatched: 'bg-purple-500',
    out_for_delivery: 'bg-yellow-500',
    delivered: 'bg-green-500',
    cancelled: 'bg-red-500',
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

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
        })
    }

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true,
        })
    }

    const getStatusLabel = (status: string) => {
        return STATUSES.find(s => s.value === status)?.label || status
    }

    return (
        <div className="p-4 sm:p-6 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#2E2E2E]">Orders</h1>
                <p className="text-sm text-[#767676] mt-1">{orders.length} total orders</p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    ⚠️ {error}
                    {error.includes('Service role key') && (
                        <p className="mt-1 text-xs">Add <code className="bg-red-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> to your .env.local and Vercel environment variables.</p>
                    )}
                </div>
            )}

            {/* Orders list */}
            {loading ? (
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
                            <div className="flex items-center gap-4">
                                <div className="h-5 w-24 bg-[#F0F0F0] rounded-lg animate-pulse" />
                                <div className="h-5 w-32 bg-[#F0F0F0] rounded-lg animate-pulse" />
                                <div className="flex-1" />
                                <div className="h-5 w-20 bg-[#F0F0F0] rounded-lg animate-pulse" />
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                                <div className="h-4 w-40 bg-[#F5F5F5] rounded animate-pulse" />
                                <div className="h-4 w-28 bg-[#F5F5F5] rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E8E8] py-20 text-center">
                    <Package size={40} className="mx-auto text-[#D0D0D0] mb-3" />
                    <p className="text-sm text-[#767676]">No orders yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => {
                        const isExpanded = expandedId === order.id
                        const tracking = trackingInputs[order.id] || { tracking_id: '', courier_name: '' }
                        const items = order.items || []
                        const addr = order.address || {}
                        const itemCount = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0)

                        return (
                            <div
                                key={order.id}
                                className={`bg-white rounded-2xl border transition-all duration-200 ${isExpanded
                                    ? 'border-[#FF6600]/30 shadow-lg shadow-orange-100/50'
                                    : 'border-[#E8E8E8] hover:border-[#D0D0D0] hover:shadow-sm'
                                    }`}
                            >
                                {/* ── Card Header (always visible) ── */}
                                <div
                                    className="p-4 sm:p-5 cursor-pointer select-none"
                                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                >
                                    {/* Top row: Order ID + date, status, total */}
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-mono text-sm font-bold text-[#2E2E2E]">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </span>
                                            <span className="text-xs text-[#999] flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(order.created_at)} · {formatTime(order.created_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[order.status] || 'bg-gray-400'}`} />
                                                {getStatusLabel(order.status)}
                                            </span>
                                            <span className="text-lg font-bold text-[#FF6600]">{formatPrice(order.total)}</span>
                                        </div>
                                    </div>

                                    {/* Second row: Customer summary + actions */}
                                    <div className="flex flex-wrap items-center justify-between mt-2.5 gap-2">
                                        <div className="flex items-center gap-4 text-xs text-[#767676]">
                                            <span className="flex items-center gap-1">
                                                <User size={12} className="text-[#999]" />
                                                <span className="font-medium text-[#2E2E2E]">{addr.full_name || '—'}</span>
                                            </span>
                                            {addr.phone && (
                                                <span className="flex items-center gap-1">
                                                    {addr.phone}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <CreditCard size={12} className="text-[#999]" />
                                                <span className="uppercase font-medium">{order.payment_method}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package size={12} className="text-[#999]" />
                                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                            {addr.phone && (
                                                <button onClick={() => openWhatsApp(addr.phone)}
                                                    className="p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors" title="WhatsApp">
                                                    <MessageCircle size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                                className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-[#FF6600] text-white' : 'bg-orange-50 text-[#FF6600] hover:bg-orange-100'}`}
                                                title={isExpanded ? 'Collapse' : 'View details'}
                                            >
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Expanded Detail Panel ── */}
                                {isExpanded && (
                                    <div className="border-t border-[#F0F0F0]">
                                        {/* Ordered Items Section */}
                                        <div className="p-4 sm:p-5">
                                            <h3 className="text-xs font-bold text-[#FF6600] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                <Package size={13} /> Ordered Items
                                            </h3>
                                            <div className="space-y-2.5">
                                                {items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-3 bg-[#FAFAFA] rounded-xl p-3">
                                                        {/* Product image */}
                                                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F0F0F0] flex-shrink-0">
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[#D0D0D0]">
                                                                    <Package size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Item details */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-[#2E2E2E] truncate">{item.name}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                {item.size && (
                                                                    <span className="text-[10px] font-semibold text-[#767676] bg-white border border-[#E8E8E8] px-1.5 py-0.5 rounded">
                                                                        {item.size}
                                                                    </span>
                                                                )}
                                                                <span className="text-xs text-[#999]">
                                                                    Qty: {item.quantity || 1}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {/* Price */}
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="text-sm font-bold text-[#2E2E2E]">{formatPrice(item.price * (item.quantity || 1))}</p>
                                                            {(item.quantity || 1) > 1 && (
                                                                <p className="text-[10px] text-[#999]">{formatPrice(item.price)} each</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Items total */}
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F0F0F0]">
                                                <span className="text-xs text-[#767676] font-medium">Order Total</span>
                                                <span className="text-base font-bold text-[#FF6600]">{formatPrice(order.total)}</span>
                                            </div>
                                        </div>

                                        {/* Customer & Address Section */}
                                        <div className="border-t border-[#F0F0F0] p-4 sm:p-5">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Customer Details */}
                                                <div>
                                                    <h3 className="text-xs font-bold text-[#FF6600] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                        <User size={13} /> Customer Details
                                                    </h3>
                                                    <div className="bg-[#FAFAFA] rounded-xl p-3.5 space-y-2">
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">Full Name</p>
                                                            <p className="text-sm font-semibold text-[#2E2E2E] mt-0.5">{addr.full_name || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">Phone</p>
                                                            <p className="text-sm text-[#2E2E2E] mt-0.5 font-mono">{addr.phone || '—'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">Payment Method</p>
                                                            <p className="text-sm text-[#2E2E2E] mt-0.5 uppercase font-medium">{order.payment_method || '—'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Delivery Address */}
                                                <div>
                                                    <h3 className="text-xs font-bold text-[#FF6600] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                        <MapPin size={13} /> Delivery Address
                                                    </h3>
                                                    <div className="bg-[#FAFAFA] rounded-xl p-3.5 space-y-2">
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">Address</p>
                                                            <p className="text-sm text-[#2E2E2E] mt-0.5">{addr.address || '—'}</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">City</p>
                                                                <p className="text-sm text-[#2E2E2E] mt-0.5">{addr.city || '—'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">State</p>
                                                                <p className="text-sm text-[#2E2E2E] mt-0.5">{addr.state || '—'}</p>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">Pincode</p>
                                                            <p className="text-sm text-[#2E2E2E] mt-0.5 font-mono font-semibold">{addr.pincode || '—'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tracking & Status Section */}
                                        <div className="border-t border-[#F0F0F0] p-4 sm:p-5" onClick={e => e.stopPropagation()}>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {/* Status Update */}
                                                <div>
                                                    <h3 className="text-xs font-bold text-[#FF6600] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                        <Hash size={13} /> Update Status
                                                    </h3>
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => patchOrder(order.id, { status: e.target.value })}
                                                        disabled={updatingId === order.id}
                                                        className={`w-full text-sm font-semibold rounded-xl px-3 py-2.5 border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FF6600]/30 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}
                                                    >
                                                        {STATUSES.map((s) => (
                                                            <option key={s.value} value={s.value}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Tracking Info */}
                                                <div>
                                                    <h3 className="text-xs font-bold text-[#FF6600] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                        <Truck size={13} /> Courier & Tracking
                                                    </h3>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <label className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">Courier Name</label>
                                                            <input value={tracking.courier_name}
                                                                onChange={e => setTrackingInputs(t => ({ ...t, [order.id]: { ...t[order.id], courier_name: e.target.value } }))}
                                                                placeholder="e.g. Delhivery, BlueDart"
                                                                className="mt-1 block w-full bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600] transition-colors" />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-semibold text-[#999] uppercase tracking-wide">Tracking ID / AWB</label>
                                                            <input value={tracking.tracking_id}
                                                                onChange={e => setTrackingInputs(t => ({ ...t, [order.id]: { ...t[order.id], tracking_id: e.target.value } }))}
                                                                placeholder="e.g. 1234567890"
                                                                className="mt-1 block w-full bg-white border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600] transition-colors" />
                                                        </div>
                                                        <button
                                                            onClick={() => patchOrder(order.id, {
                                                                tracking_id: tracking.tracking_id || null,
                                                                courier_name: tracking.courier_name || null,
                                                            })}
                                                            disabled={updatingId === order.id}
                                                            className="w-full px-4 py-2 bg-[#FF6600] text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
                                                        >
                                                            {updatingId === order.id ? 'Saving…' : 'Save Tracking'}
                                                        </button>
                                                    </div>
                                                    {(order.tracking_id || order.courier_name) && (
                                                        <p className="text-xs text-[#767676] mt-2">
                                                            Current: <span className="font-semibold text-[#2E2E2E]">{order.courier_name || '—'}</span> · <span className="font-mono font-semibold text-[#2E2E2E]">{order.tracking_id || '—'}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
