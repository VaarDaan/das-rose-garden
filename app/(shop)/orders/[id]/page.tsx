'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Clock, Truck, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface Props {
    params: Promise<{ id: string }>
}

const STEPS = [
    { key: 'confirmed', label: 'Order Confirmed', icon: CheckCircle, desc: 'Your order has been received' },
    { key: 'processed', label: 'Processing', icon: Package, desc: 'We are preparing your flowers' },
    { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'Your order is on the way' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, desc: 'Order delivered successfully' },
]

const STATUS_ORDER = ['confirmed', 'processed', 'shipped', 'delivered']

export default function OrderDetailPage({ params }: Props) {
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchAndSubscribe = async () => {
            const { id } = await params
            // Initial fetch
            const { data } = await supabase.from('orders').select('*').eq('id', id).single()
            setOrder(data as Order)
            setLoading(false)

            // Realtime subscription
            const channel = supabase
                .channel(`order-${id}`)
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${id}` }, (payload) => {
                    setOrder(payload.new as Order)
                })
                .subscribe()

            return () => { supabase.removeChannel(channel) }
        }
        fetchAndSubscribe()
    }, [])

    if (loading) {
        return <div className="px-4 py-8 space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-[#F5F5F5] animate-pulse" />)}
        </div>
    }

    if (!order) {
        return <div className="flex items-center justify-center min-h-[60vh] text-[#767676]">Order not found</div>
    }

    const currentStep = STATUS_ORDER.indexOf(order.status)

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <div className="bg-white px-4 py-3 border-b border-[#E8E8E8] flex items-center gap-3">
                <Link href="/orders" className="p-1 hover:bg-[#F5F5F5] rounded-lg">
                    <ArrowLeft size={20} className="text-[#2E2E2E]" />
                </Link>
                <div>
                    <h1 className="text-base font-bold text-[#2E2E2E]">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                    </h1>
                    <p className="text-xs text-[#767676]">
                        Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="max-w-xl mx-auto px-4 py-4 space-y-4">
                {/* Tracking Stepper */}
                <div className="card bg-white p-5">
                    <h2 className="font-bold text-[#2E2E2E] mb-5">Order Status</h2>
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-[#E8E8E8]" />
                        {/* Progress line */}
                        <motion.div
                            className="absolute left-5 top-5 w-0.5 bg-[#FF6600]"
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />

                        <div className="space-y-6">
                            {STEPS.map((step, idx) => {
                                const done = idx <= currentStep
                                const active = idx === currentStep
                                const Icon = step.icon
                                return (
                                    <div key={step.key} className="flex items-start gap-4 relative">
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: idx * 0.15 }}
                                            className={cn(
                                                'w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all',
                                                done && !active ? 'bg-[#FF6600] border-[#FF6600]' : '',
                                                active ? 'bg-[#FF6600] border-[#FF6600] shadow-lg shadow-orange-200' : '',
                                                !done ? 'bg-white border-[#E8E8E8]' : ''
                                            )}
                                        >
                                            <Icon size={16} className={done ? 'text-white' : 'text-[#ccc]'} />
                                        </motion.div>
                                        <div className="pt-1.5">
                                            <p className={cn('text-sm font-semibold', done ? 'text-[#2E2E2E]' : 'text-[#ccc]')}>
                                                {step.label}
                                            </p>
                                            <p className={cn('text-xs mt-0.5', done ? 'text-[#767676]' : 'text-[#ccc]')}>
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="card bg-white p-4">
                    <h2 className="font-bold text-[#2E2E2E] mb-3">Items ({order.items.length})</h2>
                    <div className="space-y-2">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span className="text-[#767676] flex-1 mr-2">{item.name} × {item.quantity} {item.size && `(${item.size})`}</span>
                                <span className="font-medium text-[#2E2E2E]">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                        <div className="pt-2 border-t border-[#E8E8E8] flex justify-between font-bold">
                            <span className="text-[#2E2E2E]">Total</span>
                            <span className="text-[#FF6600]">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="card bg-white p-4">
                    <h2 className="font-bold text-[#2E2E2E] mb-2">Delivery Address</h2>
                    <p className="text-sm text-[#767676] leading-relaxed">
                        {order.address.full_name}<br />
                        {order.address.address}, {order.address.city}<br />
                        {order.address.state} — {order.address.pincode}<br />
                        📞 {order.address.phone}
                    </p>
                </div>

                <div className="card bg-white p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-[#767676]">Payment Method</p>
                        <p className="text-sm font-semibold text-[#2E2E2E] capitalize">
                            {order.payment_method === 'cod' ? '💵 Cash on Delivery' : '📱 UPI'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
