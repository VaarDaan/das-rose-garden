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
                <div className="w-24 h-24 rounded-full bg-[#F9F6EE] flex items-center justify-center mb-5">
                    <ShoppingBag size={40} className="text-[#6B7A41] opacity-60" />
                </div>
                <h2 className="text-xl font-bold text-[#2C331F] mb-2">Your cart is empty</h2>
                <p className="text-sm text-[#595959] mb-6">Add some beautiful flowers to get started!</p>
                <Link href="/categories" className="btn-primary flex items-center gap-2">
                    Browse Products <ArrowRight size={16} />
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDECEF]">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 border-b border-[#D9D4CA]/60">
                <h1 className="text-xl font-bold text-[#2C331F]">Your Cart ({items.length} Items)</h1>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
                <AnimatePresence>
                    {items.map((item) => (
                        <motion.div
                            key={`${item.product_id}-${item.size}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="bg-[#F9F6EE] rounded-xl p-3 flex gap-3 border border-[#E8E4D9]/60 shadow-sm"
                        >
                            {/* Image */}
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#F0ECE2] shrink-0">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Flower2 size={28} className="text-[#6B7A41] opacity-30" />
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <Link href={`/products/${item.product_id}`}>
                                    <p className="text-sm font-semibold text-[#2C331F] line-clamp-2">{item.name}</p>
                                </Link>
                                {item.size && (
                                    <p className="text-xs text-[#595959] mt-0.5">Size: {item.size}</p>
                                )}
                                <p className="text-sm font-bold text-[#6B7A41] mt-1">{formatPrice(item.price)}</p>

                                {/* Qty controls */}
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.size, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-[#6B7A41] text-white hover:bg-[#5A6836] transition-colors rounded-l-lg"
                                        >
                                            <Minus size={13} />
                                        </button>
                                        <span className="w-9 h-8 flex items-center justify-center text-sm font-bold text-[#2C331F] bg-white border-y border-[#D9D4CA]">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.size, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center bg-[#6B7A41] text-white hover:bg-[#5A6836] transition-colors rounded-r-lg"
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.product_id, item.size)}
                                        className="ml-auto p-2 rounded-lg hover:bg-red-50 text-[#595959] hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Order summary */}
                <div className="bg-[#F9F6EE] rounded-xl p-4 space-y-2 border border-[#E8E4D9]/60">
                    <div className="flex justify-between text-sm text-[#595959]">
                        <span>Subtotal:</span>
                        <span className="font-medium text-[#2C331F]">{formatPrice(totalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#595959]">
                        <span>Shipping:</span>
                        <span className={totalPrice() >= 999 ? 'text-green-700 font-medium' : 'font-medium text-[#2C331F]'}>
                            {totalPrice() >= 999 ? 'FREE' : formatPrice(49)}
                        </span>
                    </div>
                    <div className="pt-2 border-t border-[#E8E4D9] flex justify-between font-bold text-base text-[#2C331F]">
                        <span>Total:</span>
                        <span className="text-[#6B7A41]">
                            {formatPrice(totalPrice() + (totalPrice() >= 999 ? 0 : 49))}
                        </span>
                    </div>
                </div>

                {totalPrice() < 999 && (
                    <div className="bg-[#6B7A41]/8 border border-[#6B7A41]/20 rounded-xl p-3 text-xs text-[#6B7A41] font-medium">
                        🚚 Add {formatPrice(999 - totalPrice())} more for FREE delivery!
                    </div>
                )}

                <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 !rounded-xl text-sm">
                    PROCEED TO CHECKOUT
                </Link>

                <Link href="/categories" className="block text-center text-sm text-[#6B7A41] font-medium hover:underline py-1">
                    Continue Shopping
                </Link>
            </div>
        </div>
    )
}
