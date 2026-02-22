'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCartStore } from '@/lib/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { Flower2, CheckCircle, MapPin, CreditCard } from 'lucide-react'
import Link from 'next/link'
import Script from 'next/script'
import { createShipment } from '@/lib/shipping'

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
    const [placed, setPlaced] = useState<string | null>(null)
    const [trackingInfo, setTrackingInfo] = useState<{ id: string, courier: string } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const shipping = totalPrice() >= 999 ? 0 : 49
    const total = totalPrice() + shipping

    const saveOrderAndShip = async (user: any, formData: FormData, paymentMode: 'online' | 'cod', rzpResponse: any | null = null) => {
        // 1. Save strictly to DB
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                items: items,
                total,
                status: 'received',
                payment_method: paymentMode,
                address: formData,
            })
            .select()
            .single()

        if (error || !order) {
            alert('Failed to save order to database')
            setPlacing(false)
            return
        }

        // 2. Call mock shipping integration
        try {
            const shipmentRes = await createShipment({
                orderId: order.id,
                items,
                address: formData
            });
            if (shipmentRes.success && shipmentRes.trackingId && shipmentRes.courierName) {
                setTrackingInfo({ id: shipmentRes.trackingId, courier: shipmentRes.courierName });
            }
        } catch (err) {
            console.error('Shipping integration warning:', err)
        }

        clearCart()
        setPlaced(order.id)
        setPlacing(false)
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
                    alert('Payment gateway error. Please try again.')
                    setPlacing(false)
                    return
                }

                // 2. Load standard Razorpay UI
                const options = {
                    key: 'rzp_test_SIr1jxT4ytMqqL', // Sandbox Key
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
                        color: '#FF6600'
                    },
                    modal: {
                        ondismiss: function () {
                            setPlacing(false)
                        }
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    alert('Payment failed. Try again.');
                    console.error(response.error);
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

    if (placed) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-5">
                    <CheckCircle size={50} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#2E2E2E] mb-2">Order Placed! 🌹</h2>
                <p className="text-sm text-[#767676] mb-2">Thank you for your order</p>
                <p className="text-xs text-[#767676] mb-4 font-mono bg-[#F5F5F5] px-3 py-1 rounded-lg">#{placed.slice(0, 8).toUpperCase()}</p>

                {trackingInfo && (
                    <div className="bg-[#F9F0EC] p-3 rounded-lg border border-[#FF6600]/20 mb-6 w-full max-w-xs text-left">
                        <p className="text-xs font-semibold text-[#FF6600] uppercase mb-1">Shipping Info</p>
                        <p className="text-sm text-[#2E2E2E] font-medium">Tracking: {trackingInfo.id}</p>
                        <p className="text-xs text-[#767676]">Courier: {trackingInfo.courier}</p>
                    </div>
                )}

                <div className="flex gap-3">
                    <Link href={`/orders/${placed}`} className="btn-primary">Track Order</Link>
                    <Link href="/" className="btn-secondary">Continue Shopping</Link>
                </div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                <Flower2 size={48} className="text-[#FF6600] opacity-30 mb-3" />
                <p className="text-base font-semibold text-[#2E2E2E]">Your cart is empty</p>
                <Link href="/categories" className="btn-primary mt-4">Shop Now</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <div className="bg-white px-4 py-3 border-b border-[#E8E8E8]">
                <h1 className="text-lg font-bold text-[#2E2E2E]">Checkout</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto px-4 py-4 space-y-4">
                {/* Shipping */}
                <div className="card bg-white p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin size={18} className="text-[#FF6600]" />
                        <h2 className="font-bold text-[#2E2E2E]">Delivery Address</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {[
                            { field: 'full_name', label: 'Full Name', placeholder: 'Ravi Kumar' },
                            { field: 'phone', label: 'Phone Number', placeholder: '9876543210' },
                        ].map(({ field, label, placeholder }) => (
                            <div key={field}>
                                <label className="block text-xs font-semibold text-[#767676] mb-1">{label}</label>
                                <input
                                    {...register(field as keyof FormData)}
                                    placeholder={placeholder}
                                    className="input-field"
                                />
                                {errors[field as keyof FormData] && (
                                    <p className="text-red-500 text-xs mt-1">{errors[field as keyof FormData]?.message}</p>
                                )}
                            </div>
                        ))}
                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Pincode</label>
                            <input {...register('pincode')} placeholder="400001" maxLength={6} className="input-field" />
                            {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Address</label>
                            <textarea {...register('address')} placeholder="House/Flat No., Street, Landmark" rows={2} className="input-field resize-none" />
                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-[#767676] mb-1">City</label>
                                <input {...register('city')} placeholder="Mumbai" className="input-field" />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#767676] mb-1">State</label>
                                <input {...register('state')} placeholder="Maharashtra" className="input-field" />
                                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment */}
                <div className="card bg-white p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CreditCard size={18} className="text-[#FF6600]" />
                        <h2 className="font-bold text-[#2E2E2E]">Payment Method</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { method: 'online' as const, label: 'Pay Online', emoji: '💳', sub: 'UPI, Cards, Wallets via Razorpay' },
                            { method: 'cod' as const, label: 'Cash on Delivery', emoji: '💵', sub: 'Pay when delivered' },
                        ].map(({ method, label, emoji, sub }) => (
                            <button
                                key={method}
                                type="button"
                                onClick={() => setPaymentMethod(method)}
                                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${paymentMethod === method
                                    ? 'border-[#FF6600] bg-orange-50'
                                    : 'border-[#E8E8E8] hover:border-gray-300'
                                    }`}
                            >
                                <span className="text-2xl mb-1">{emoji}</span>
                                <p className="text-xs font-bold text-[#2E2E2E]">{label}</p>
                                <p className="text-[10px] text-[#767676] mt-0.5 text-center">{sub}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div className="card bg-white p-4">
                    <h2 className="font-bold text-[#2E2E2E] mb-3">Order Summary</h2>
                    <div className="space-y-2 mb-3">
                        {items.map((item) => (
                            <div key={`${item.product_id}-${item.size}`} className="flex justify-between text-sm">
                                <span className="text-[#767676] flex-1 mr-2 line-clamp-1">
                                    {item.name} × {item.quantity} {item.size && `(${item.size})`}
                                </span>
                                <span className="font-medium text-[#2E2E2E] shrink-0">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="pt-2 border-t border-[#E8E8E8] space-y-1">
                        <div className="flex justify-between text-sm text-[#767676]">
                            <span>Delivery</span>
                            <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-base text-[#2E2E2E] pt-1">
                            <span>Total</span>
                            <span className="text-[#FF6600]">{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={placing}
                    className="btn-primary w-full py-4 text-base !rounded-xl"
                >
                    {placing ? 'Processing…' : `Place Order · ${formatPrice(total)}`}
                </button>
            </form>
        </div>
    )
}
