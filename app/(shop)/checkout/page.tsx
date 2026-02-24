'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/lib/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Flower2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { createShipment } from '@/lib/shipping'
import { cn } from '@/lib/utils'

const schema = z.object({
    full_name: z.string().min(2, 'Name is required'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore()
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('cod')
    const [placing, setPlacing] = useState(false)

    const [showSummary, setShowSummary] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const shipping = totalPrice() >= 999 ? 0 : 49
    const total = totalPrice() + shipping

    const saveOrderAndShip = async (user: any, formData: FormData, paymentMode: 'online' | 'cod', rzpResponse: any | null = null) => {
        // 1. Call server-side API for atomic stock decrement + order creation
        const res = await fetch('/api/orders/place', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items,
                total,
                payment_method: paymentMode,
                address: formData,
            }),
        })

        const data = await res.json()

        if (!res.ok || !data?.id) {
            alert(data?.error || 'Failed to place order. Please try again.')
            setPlacing(false)
            return
        }

        const order = data

        // 2. Call mock shipping integration
        let shipTrackingId = ''
        let shipCourier = ''
        try {
            const shipmentRes = await createShipment({
                orderId: order.id,
                items,
                address: formData
            });
            if (shipmentRes.success && shipmentRes.trackingId && shipmentRes.courierName) {
                shipTrackingId = shipmentRes.trackingId
                shipCourier = shipmentRes.courierName
            }
        } catch (err) {
            console.error('Shipping integration warning:', err)
        }

        clearCart()
        setPlacing(false)

        // Redirect to animated success page
        const params = new URLSearchParams({ order: order.id })
        if (shipTrackingId) params.set('tracking', shipTrackingId)
        if (shipCourier) params.set('courier', shipCourier)
        router.push(`/checkout/success?${params.toString()}`)
    }

    const onSubmit = async (formData: FormData) => {
        setPlacing(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        if (paymentMethod === 'online') {
            try {
                // 1. Create native Razorpay order
                const res = await fetch('/api/razorpay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: total, receipt: `rcpt_${Date.now()}` })
                })
                const rzpOrder = await res.json()

                if (!res.ok) {
                    console.error('Backend Razorpay Order Error:', rzpOrder);
                    alert(`Payment gateway error: ${rzpOrder.error?.description || rzpOrder.error || 'Please try again.'}`)
                    setPlacing(false)
                    return
                }

                // 2. Check that Razorpay SDK loaded
                if (!(window as any).Razorpay) {
                    console.error('Razorpay SDK not found on window object. Script may have failed to load or is blocked.')
                    alert('Payment gateway is still loading. Please wait a moment and try again. If the issue persists, check your ad-blocker or internet connection.');
                    setPlacing(false);
                    return;
                }

                const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
                if (!razorpayKey) {
                    console.error('CRITICAL: NEXT_PUBLIC_RAZORPAY_KEY_ID is missing from environment variables.')
                }

                const options = {
                    key: razorpayKey,
                    amount: rzpOrder.amount,
                    currency: rzpOrder.currency,
                    name: 'Das Rose Garden',
                    description: 'Order Payment',
                    order_id: rzpOrder.id,
                    handler: async function (response: any) {
                        console.log('Payment successful via Razorpay', response);
                        await saveOrderAndShip(user, formData, 'online', response);
                    },
                    prefill: {
                        name: formData.full_name,
                        email: user.email,
                        contact: formData.phone,
                    },
                    theme: {
                        color: '#6B7A41'
                    },
                    modal: {
                        ondismiss: function () {
                            setPlacing(false)
                        }
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    console.error('Razorpay payment.failed response:', response.error);
                    alert(`Payment failed: ${response.error.description || 'Please try again.'}`);
                    setPlacing(false)
                });
                rzp.open();
            } catch (err) {
                console.error('Razorpay process failed:', err)
                setPlacing(false)
                alert('Something went wrong. Please check your connection.')
            }
        } else {
            // Cash on delivery
            await saveOrderAndShip(user, formData, 'cod');
        }
    }



    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                <Flower2 size={48} className="text-[#6B7A41] opacity-30 mb-3" />
                <p className="text-base font-semibold text-[#2C331F]">Your cart is empty</p>
                <Link href="/categories" className="btn-primary mt-4">Shop Now</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDECEF]">
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
                onError={(e) => {
                    console.error('Failed to load Razorpay checkout script', e)
                }}
            />

            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-[#D9D4CA]/60">
                <h1 className="text-xl font-bold text-[#2C331F]">Checkout</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 py-4 space-y-4">

                {/* Collapsible Order Summary */}
                <div className="bg-[#F9F6EE] rounded-xl border border-[#E8E4D9]/60 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowSummary(!showSummary)}
                        className="w-full flex items-center justify-between px-4 py-3"
                    >
                        <span className="font-bold text-[#2C331F] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Order Summary</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[#595959]">{items.reduce((s, i) => s + i.quantity, 0)} Items: <strong className="text-[#2C331F]">{formatPrice(total)}</strong></span>
                            <ChevronDown size={16} className={cn('text-[#595959] transition-transform', showSummary && 'rotate-180')} />
                        </div>
                    </button>
                    {showSummary && (
                        <div className="px-4 pb-3 space-y-2 border-t border-[#E8E4D9]/60 pt-2">
                            {items.map((item) => (
                                <div key={`${item.product_id}-${item.size}`} className="flex justify-between text-sm">
                                    <span className="text-[#595959] flex-1 mr-2 line-clamp-1">
                                        {item.name} × {item.quantity} {item.size && `(${item.size})`}
                                    </span>
                                    <span className="font-medium text-[#2C331F] shrink-0">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-sm text-[#595959]">
                                <span>Delivery</span>
                                <span className={shipping === 0 ? 'text-green-700 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Information */}
                <div className="bg-[#F9F6EE] rounded-xl p-4 border border-[#E8E4D9]/60">
                    <h2 className="font-bold text-[#2C331F] mb-3 text-base">Contact Information</h2>
                    <div className="space-y-3">
                        <div>
                            <input {...register('phone')} placeholder="Phone" type="tel" className="input-field" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-[#F9F6EE] rounded-xl p-4 border border-[#E8E4D9]/60">
                    <h2 className="font-bold text-[#2C331F] mb-3 text-base">Shipping Address</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <input {...register('full_name')} placeholder="Name" className="input-field" />
                            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                        </div>
                        <div>
                            <textarea {...register('address')} placeholder="Address" rows={2} className="input-field resize-none" />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input {...register('city')} placeholder="City" className="input-field" />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                            </div>
                            <div>
                                <input {...register('pincode')} placeholder="Postal Code" maxLength={6} className="input-field" />
                                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                            </div>
                        </div>
                        <div>
                            <input {...register('state')} placeholder="State" className="input-field" />
                            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-[#F9F6EE] rounded-xl p-4 border border-[#E8E4D9]/60">
                    <h2 className="font-bold text-[#2C331F] mb-3 text-base">Payment Method</h2>
                    <div className="space-y-3">
                        {[
                            { method: 'online' as const, label: 'Pay Online', sub: 'UPI, Cards, Wallets via Razorpay', emoji: '💳' },
                            { method: 'cod' as const, label: 'Cash on Delivery', sub: 'Pay when delivered', emoji: '💵' },
                        ].map(({ method, label, sub, emoji }) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-all text-left ${paymentMethod === method
                                    ? 'border-[#6B7A41] bg-[#6B7A41]/5'
                                    : 'border-[#D9D4CA] hover:border-[#B5B5A8]'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-[#6B7A41]' : 'border-[#D9D4CA]'}`}>
                                    {paymentMethod === method && <div className="w-2.5 h-2.5 rounded-full bg-[#6B7A41]" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-[#2C331F]">{label}</p>
                                    <p className="text-xs text-[#595959]">{sub}</p>
                                </div>
                                <span className="text-xl">{emoji}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={placing}
                    className="btn-primary w-full py-4 text-sm !rounded-xl"
                >
                    {placing ? 'Processing…' : 'PLACE ORDER'}
                </button>

                <p className="text-center text-xs text-[#595959] pb-2">
                    By placing order, you agree to <Link href="#" className="text-[#6B7A41] underline">Terms</Link>
                </p>
            </form>
        </div>
    )
}
