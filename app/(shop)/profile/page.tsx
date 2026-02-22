'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
    User, Phone, Package, LogOut, ChevronRight,
    Flower2, Mail, MapPin, Pencil, X, Check,
    MessageCircle, Truck,
} from 'lucide-react'
import Link from 'next/link'
import type { Order, ShippingAddress } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'

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
    packed: 'bg-orange-100 text-orange-700',
    dispatched: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-yellow-100 text-yellow-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

const EMPTY_ADDRESS: ShippingAddress = { full_name: '', phone: '', pincode: '', address: '', city: '', state: '' }

function getInitials(name: string | null | undefined, email: string | null | undefined) {
    if (name?.trim()) return name.trim().slice(0, 2).toUpperCase()
    if (email) return email.slice(0, 2).toUpperCase()
    return 'U'
}

export default function ProfilePage() {
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
    const [profileRow, setProfileRow] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState('')
    const [activeOrders, setActiveOrders] = useState<Order[]>([])
    const [recentOrders, setRecentOrders] = useState<Order[]>([])

    // Edit form
    const [editName, setEditName] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [editAddress, setEditAddress] = useState<ShippingAddress>(EMPTY_ADDRESS)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }
            setAuthUser(user)

            // Upsert profile row so Google users always have one
            await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email ?? null,
                full_name: profileRow?.full_name ?? (user.user_metadata?.full_name || user.user_metadata?.name || null),
            }, { onConflict: 'id', ignoreDuplicates: true })

            const [{ data: pData }, { data: oData }] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
            ])

            setProfileRow(pData)
            setEditName(pData?.full_name ?? '')
            setEditPhone(pData?.phone ?? '')
            setEditAddress(pData?.address ?? EMPTY_ADDRESS)

            const orders = (oData as Order[]) || []
            setActiveOrders(orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled'))
            setRecentOrders(orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').slice(0, 3))

            setLoading(false)
        }
        fetchData()
    }, [])

    const saveProfile = async () => {
        setSaving(true)
        setSaveError('')
        if (!authUser) return
        const { error } = await supabase.from('profiles').update({
            full_name: editName.trim() || null,
            phone: editPhone.trim() || null,
            address: editAddress.address.trim() ? editAddress : null,
        }).eq('id', authUser.id)
        if (error) { setSaveError('Failed to save. Please try again.') }
        else {
            setProfileRow((p: any) => ({ ...p, full_name: editName, phone: editPhone, address: editAddress }))
            setEditing(false)
        }
        setSaving(false)
    }

    const cancelEdit = () => {
        setSaveError(''); setEditing(false)
        setEditName(profileRow?.full_name ?? '')
        setEditPhone(profileRow?.phone ?? '')
        setEditAddress(profileRow?.address ?? EMPTY_ADDRESS)
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) return (
        <div className="px-4 py-8 space-y-4">
            <div className="h-48 rounded-2xl bg-[#F5F5F5] animate-pulse" />
            <div className="h-40 rounded-xl bg-[#F5F5F5] animate-pulse" />
            <div className="h-28 rounded-xl bg-[#F5F5F5] animate-pulse" />
        </div>
    )

    // NOT logged in
    if (!authUser) return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
            <Flower2 size={48} className="text-[#FF6600] opacity-30 mb-3" />
            <p className="text-base font-semibold text-[#2E2E2E] mb-4">Sign in to view your profile</p>
            <Link href="/login" className="btn-primary">Sign In</Link>
        </div>
    )

    const displayName = profileRow?.full_name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Customer'
    const initials = getInitials(profileRow?.full_name || authUser.user_metadata?.full_name, authUser.email)
    const addr = profileRow?.address

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#FF6600] to-rose-500 px-4 py-8 flex flex-col items-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/25 backdrop-blur flex items-center justify-center mb-3 text-2xl font-bold">
                    {initials}
                </div>
                <h1 className="text-xl font-bold">{displayName}</h1>
                {authUser.email && (
                    <p className="text-sm text-white/80 mt-0.5 flex items-center gap-1.5">
                        <Mail size={13} /> {authUser.email}
                    </p>
                )}
            </div>

            <div className="px-4 py-4 space-y-3 max-w-2xl mx-auto">

                {/* Personal Details */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F5F5]">
                        <p className="text-sm font-bold text-[#2E2E2E]">Personal Details</p>
                        {!editing ? (
                            <button onClick={() => { setSaveError(''); setEditing(true) }} className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6600] hover:opacity-75">
                                <Pencil size={13} /> Edit
                            </button>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button onClick={cancelEdit} className="flex items-center gap-1 text-xs font-semibold text-[#767676] hover:opacity-75"><X size={13} /> Cancel</button>
                                <button onClick={saveProfile} disabled={saving} className="flex items-center gap-1 text-xs font-semibold text-green-600 hover:opacity-75 disabled:opacity-50">
                                    <Check size={13} /> {saving ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-3 space-y-4">
                        {saveError && <p className="text-xs text-red-500">{saveError}</p>}

                        <div>
                            <label className="text-xs text-[#767676] font-semibold flex items-center gap-1.5 mb-1"><User size={12} /> Full Name</label>
                            {editing ? (
                                <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Your full name"
                                    className="w-full bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600]" />
                            ) : (
                                <p className="text-sm text-[#2E2E2E]">{profileRow?.full_name || <span className="text-[#B0B0B0]">Not set</span>}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-[#767676] font-semibold flex items-center gap-1.5 mb-1"><Phone size={12} /> Phone Number</label>
                            {editing ? (
                                <input value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+91 98765 43210" type="tel"
                                    className="w-full bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600]" />
                            ) : (
                                <p className="text-sm text-[#2E2E2E]">{profileRow?.phone || <span className="text-[#B0B0B0]">Not set</span>}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs text-[#767676] font-semibold flex items-center gap-1.5 mb-1"><MapPin size={12} /> Delivery Address</label>
                            {editing ? (
                                <div className="space-y-2">
                                    <input value={editAddress.address} onChange={e => setEditAddress(a => ({ ...a, address: e.target.value }))} placeholder="Street / House / Flat"
                                        className="w-full bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600]" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input value={editAddress.city} onChange={e => setEditAddress(a => ({ ...a, city: e.target.value }))} placeholder="City"
                                            className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600]" />
                                        <input value={editAddress.state} onChange={e => setEditAddress(a => ({ ...a, state: e.target.value }))} placeholder="State"
                                            className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600]" />
                                    </div>
                                    <input value={editAddress.pincode} onChange={e => setEditAddress(a => ({ ...a, pincode: e.target.value }))} placeholder="Pincode" maxLength={6} type="tel"
                                        className="w-full bg-[#F5F5F5] border border-[#E8E8E8] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FF6600]" />
                                </div>
                            ) : addr ? (
                                <p className="text-sm text-[#2E2E2E] leading-relaxed">{addr.address}, {addr.city}, {addr.state} – {addr.pincode}</p>
                            ) : (
                                <p className="text-sm text-[#B0B0B0]">Not set</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Active Orders (tracking) */}
                {activeOrders.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#F5F5F5]">
                            <p className="text-sm font-bold text-[#2E2E2E] flex items-center gap-2">
                                <Truck size={15} className="text-[#FF6600]" /> Track Active Orders
                            </p>
                        </div>
                        <div className="divide-y divide-[#F5F5F5]">
                            {activeOrders.map(order => (
                                <Link key={order.id} href={`/orders/${order.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5F5] transition-colors">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F9F0EC] shrink-0 flex items-center justify-center">
                                        {order.items[0]?.image
                                            ? <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                                            : <Flower2 size={18} className="text-[#FF6600] opacity-40" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[#767676]">#{order.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-sm font-semibold text-[#2E2E2E] truncate">{order.items.map(i => i.name).join(', ')}</p>
                                        {order.courier_name && order.tracking_id && (
                                            <p className="text-[10px] text-[#767676] truncate">{order.courier_name} · {order.tracking_id}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        <span className={`badge text-[10px] ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                        <span className="text-[10px] text-[#FF6600] font-semibold">Track →</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Past Orders */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#F5F5F5]">
                        <p className="text-sm font-bold text-[#2E2E2E] flex items-center gap-2">
                            <Package size={15} className="text-[#FF6600]" /> Past Orders
                        </p>
                        <Link href="/orders" className="text-xs font-semibold text-[#FF6600] hover:opacity-75">
                            View All <ChevronRight size={12} className="inline" />
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <div className="py-8 flex flex-col items-center text-center">
                            <Package size={32} className="text-[#FF6600] opacity-30 mb-2" />
                            <p className="text-sm text-[#767676]">No delivered orders yet</p>
                            <Link href="/categories" className="text-xs font-semibold text-[#FF6600] mt-2 hover:opacity-75">Start Shopping →</Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#F5F5F5]">
                            {recentOrders.map(order => (
                                <Link key={order.id} href={`/orders/${order.id}`}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5F5] transition-colors">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F9F0EC] shrink-0 flex items-center justify-center">
                                        {order.items[0]?.image
                                            ? <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                                            : <Flower2 size={18} className="text-[#FF6600] opacity-40" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-[#767676]">#{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        <p className="text-sm font-semibold text-[#2E2E2E] truncate">{order.items.map(i => i.name).join(', ')}</p>
                                    </div>
                                    <span className="text-sm font-bold text-[#FF6600] shrink-0">{formatPrice(order.total)}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* WhatsApp Support */}
                <a href="https://wa.me/918250928721" target="_blank" rel="noopener noreferrer"
                    className="bg-white rounded-2xl shadow-sm flex items-center gap-3 px-4 py-4 hover:bg-green-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                        <MessageCircle size={18} className="text-green-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-[#2E2E2E]">WhatsApp Support</p>
                        <p className="text-xs text-[#767676]">Chat with us for help with your order</p>
                    </div>
                    <ChevronRight size={16} className="text-[#767676]" />
                </a>

                {/* Sign Out */}
                <button onClick={handleSignOut}
                    className="bg-white rounded-2xl shadow-sm w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 text-left transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <LogOut size={18} className="text-red-500" />
                    </div>
                    <span className="text-sm font-semibold text-red-500">Sign Out</span>
                </button>

                <p className="text-center text-[10px] text-[#B0B0B0] pb-2">Das Rose Garden · Premium flowers, delivered fresh</p>
            </div>
        </div>
    )
}
