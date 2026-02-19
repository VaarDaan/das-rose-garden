'use client'

import { useCartStore } from '@/lib/store/cartStore'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Flower2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-5">
                    <ShoppingBag size={40} className="text-[#FF6600] opacity-60" />
                </div>
                <h2 className="text-xl font-bold text-[#2E2E2E] mb-2">Your cart is empty</h2>
                <p className="text-sm text-[#767676] mb-6">Add some beautiful flowers to get started!</p>
                <Link href="/categories" className="btn-primary flex items-center gap-2">
                    Browse Products <ArrowRight size={16} />
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <div className="bg-white px-4 py-3 border-b border-[#E8E8E8]">
                <h1 className="text-lg font-bold text-[#2E2E2E]">My Cart ({items.length} items)</h1>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
                <AnimatePresence>
                    {items.map((item) => (
                        <motion.div
                            key={`${item.product_id}-${item.size}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="card bg-white p-3 flex gap-3"
                        >
                            {/* Image */}
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F9F0EC] shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Flower2 size={28} className="text-[#FF6600] opacity-30" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/products/${item.product_id}`}>
                                    <p className="text-sm font-semibold text-[#2E2E2E] line-clamp-2">{item.name}</p>
                                </Link>
                                {item.size && (
                                    <p className="text-xs text-[#767676] mt-0.5">Size: {item.size}</p>
                                )}
                                <p className="text-sm font-bold text-[#FF6600] mt-1">{formatPrice(item.price)}</p>

                                {/* Qty controls */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center border border-[#E8E8E8] rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                                            className="px-2.5 py-1.5 hover:bg-[#F5F5F5] text-[#2E2E2E]"
                                        >
                                            <Minus size={13} />
                                        </button>
                                        <span className="px-3 py-1.5 text-sm font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                                            className="px-2.5 py-1.5 hover:bg-[#F5F5F5] text-[#2E2E2E]"
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.product_id, item.size)}
                                        className="ml-auto p-1.5 rounded-lg hover:bg-red-50 text-[#767676] hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Order summary */}
                <div className="card bg-white p-4 space-y-2">
                    <p className="text-sm font-bold text-[#2E2E2E] mb-3">Price Details</p>
                    <div className="flex justify-between text-sm text-[#767676]">
                        <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                        <span>{formatPrice(totalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#767676]">
                        <span>Delivery</span>
                        <span className={totalPrice() >= 999 ? 'text-green-600 font-medium' : ''}>
                            {totalPrice() >= 999 ? 'FREE' : formatPrice(49)}
                        </span>
                    </div>
                    <div className="pt-2 border-t border-[#E8E8E8] flex justify-between font-bold text-base text-[#2E2E2E]">
                        <span>Total</span>
                        <span className="text-[#FF6600]">
                            {formatPrice(totalPrice() + (totalPrice() >= 999 ? 0 : 49))}
                        </span>
                    </div>
                </div>

                {totalPrice() < 999 && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-[#FF6600] font-medium">
                        🚚 Add {formatPrice(999 - totalPrice())} more for FREE delivery!
                    </div>
                )}

                <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3 !rounded-xl">
                    Proceed to Checkout <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    )
}
