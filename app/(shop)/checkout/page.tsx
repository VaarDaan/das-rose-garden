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
import { createShipment } from '@/lib/shipping'
import { cn } from '@/lib/utils'

const RAZORPAY_KEY_ID = 'rzp_test_SJsOtIgYyz2NgA'

const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => { resolve(true); };
        script.onerror = () => { resolve(false); };
        document.body.appendChild(script);
    });
};

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
                // ── Step 1: Load the Razorpay script ──
                console.log('[Checkout] Loading Razorpay script…')
                const isLoaded = await loadRazorpayScript();
                if (!isLoaded) {
                    alert('Razorpay script failed to inject into the DOM. Check CORS/CSP.');
                    setPlacing(false);
                    return;
                }
                console.log('[Checkout] ✅ Razorpay script loaded, window.Razorpay:', typeof (window as any).Razorpay)

                // ── Step 2: Create Razorpay order via backend ──
                console.log('[Checkout] Calling /api/razorpay to create order…')
                const res = await fetch('/api/razorpay', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: total, receipt: `rcpt_${Date.now()}` })
                })
                const rzpOrder = await res.json()
                console.log('[Checkout] Backend response:', res.status, rzpOrder)

                if (!res.ok) {
                    console.error('[Checkout] ❌ Backend order creation failed:', rzpOrder)
                    alert(`Payment gateway error: ${rzpOrder.error?.description || rzpOrder.error || 'Please try again.'}`)
                    setPlacing(false)
                    return
                }

                console.log('[Checkout] ✅ Order created, order_id:', rzpOrder.id)

                // ── Step 3: Initialize Razorpay and open modal ──
                console.log('[Checkout] Opening Razorpay modal…')
                const options = {
                    key: RAZORPAY_KEY_ID,
                    amount: rzpOrder.amount,
                    currency: rzpOrder.currency,
                    name: 'Das Rose Garden',
                    description: 'Order Payment',
                    order_id: rzpOrder.id,
                    handler: async function (response: any) {
                        console.log('[Checkout] ✅ Payment successful:', response)
                        await saveOrderAndShip(user, formData, 'online', response)
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
                            console.log('[Checkout] Payment modal dismissed by user')
                            setPlacing(false)
                        }
                    }
                }

                console.log('[Checkout] Razorpay options:', { ...options, key: '***' })
                const rzp = new (window as any).Razorpay(options)
                rzp.on('payment.failed', function (response: any) {
                    console.error('[Checkout] ❌ Payment failed:', response.error)
                    alert(`Payment failed: ${response.error.description || 'Please try again.'}`)
                    setPlacing(false)
                })
                rzp.open()
            } catch (err) {
                console.error('[Checkout] ❌ Exception during payment:', err)
                setPlacing(false)
                alert('Something went wrong. Please check your connection.')
            }
        } else {
            // Cash on delivery
            await saveOrderAndShip(user, formData, 'cod')
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
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-[#D9D4CA]/60">
                <h1 className="text-xl font-bold text-[#2C331F]">Checkout</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 py-4 space-y-4">

                {/* Collapsible Order Summary */}
                <div className="bg-white rounded-2xl border border-[#E8E4D9] overflow-hidden">
                    <button type="button" onClick={() => setShowSummary(!showSummary)} className="w-full flex items-center justify-between px-4 py-3">
                        <span className="text-sm font-bold text-[#2C331F]">Order Summary ({items.length} items)</span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#6B7A41]">{formatPrice(total)}</span>
                            <ChevronDown size={16} className={cn('transition-transform text-[#595959]', showSummary && 'rotate-180')} />
                        </div>
                    </button>
                    {showSummary && (
                        <div className="px-4 pb-3 space-y-2 border-t border-[#E8E4D9]">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between py-1.5 text-sm">
                                    <span className="text-[#2C331F] truncate max-w-[60%]">{item.name} × {item.quantity}</span>
                                    <span className="text-[#595959]">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <div className="pt-1.5 border-t border-[#E8E4D9]">
                                <div className="flex justify-between text-xs text-[#595959]">
                                    <span>Subtotal</span><span>{formatPrice(totalPrice())}</span>
                                </div>
                                <div className="flex justify-between text-xs text-[#595959]">
                                    <span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Shipping Form */}
                <div className="bg-white rounded-2xl border border-[#E8E4D9] p-4 space-y-3">
                    <h2 className="text-sm font-bold text-[#2C331F] mb-1">Shipping Address</h2>
                    {[
                        { name: 'full_name' as const, label: 'Full Name', type: 'text' },
                        { name: 'phone' as const, label: 'Phone', type: 'tel' },
                        { name: 'pincode' as const, label: 'Pincode', type: 'text' },
                        { name: 'address' as const, label: 'Address', type: 'text' },
                        { name: 'city' as const, label: 'City', type: 'text' },
                        { name: 'state' as const, label: 'State', type: 'text' },
                    ].map((field) => (
                        <div key={field.name}>
                            <label className="block text-xs text-[#595959] mb-0.5 font-medium">{field.label}</label>
                            <input
                                {...register(field.name)}
                                type={field.type}
                                className={cn(
                                    'w-full px-3 py-2.5 rounded-xl text-sm bg-[#F9F6EE] border transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B7A41]',
                                    errors[field.name] ? 'border-red-400' : 'border-[#E8E4D9]'
                                )}
                            />
                            {errors[field.name] && <p className="text-red-500 text-xs mt-0.5">{errors[field.name]?.message}</p>}
                        </div>
                    ))}
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-[#E8E4D9] p-4 space-y-3">
                    <h2 className="text-sm font-bold text-[#2C331F] mb-1">Payment Method</h2>
                    {[
                        { value: 'cod' as const, label: 'Cash on Delivery', icon: '💵' },
                        { value: 'online' as const, label: 'Pay Online (Razorpay)', icon: '💳' },
                    ].map((m) => (
                        <button
                            key={m.value}
                            type="button"
                            onClick={() => setPaymentMethod(m.value)}
                            className={cn(
                                'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                                paymentMethod === m.value
                                    ? 'border-[#6B7A41] bg-[#6B7A41]/5 ring-1 ring-[#6B7A41]'
                                    : 'border-[#E8E4D9] hover:border-[#B5B5A8]'
                            )}
                        >
                            <span className="text-xl">{m.icon}</span>
                            <span className="text-sm font-semibold text-[#2C331F]">{m.label}</span>
                        </button>
                    ))}
                </div>

                {/* Place Order Button */}
                <button
                    type="submit"
                    disabled={placing}
                    className="w-full bg-[#6B7A41] text-white font-bold py-4 rounded-2xl text-base hover:bg-[#5A6836] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {placing ? (
                        <><span className="animate-spin">⏳</span> Processing…</>
                    ) : (
                        <>{paymentMethod === 'online' ? '💳 Pay Now' : '📦 Place Order'} — {formatPrice(total)}</>
                    )}
                </button>

            </form>
        </div>
    )
}
