'use client'

import Link from 'next/link'
import { Flower2, Star, ShoppingCart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cartStore'
import type { Product } from '@/lib/types'
import { motion } from 'framer-motion'

interface Props {
    product: Product
}

export default function ProductCard({ product }: Props) {
    const addItem = useCartStore((s) => s.addItem)

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            size: product.size?.[0] || null,
            image: product.images?.[0] || null,
        })
    }

    return (
        <motion.div
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl overflow-hidden group flex-shrink-0 w-[160px] sm:w-[180px] shadow-sm hover:shadow-lg transition-shadow"
        >
            <Link href={`/products/${product.id}`} className="block">
                {/* Image */}
                <div className="product-image-container group">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="product-image group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-[#F9F6EE]">
                            <Flower2 size={40} className="text-[#6B7A41] opacity-30" />
                        </div>
                    )}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-[#2C331F] text-xs font-semibold px-2.5 py-1 rounded-lg">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-3 bg-[#F9F6EE]">
                    <p className="text-sm font-semibold text-[#2C331F] line-clamp-2 leading-tight mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {product.name}
                    </p>
                    <p className="text-sm font-bold text-[#2C331F] mb-2">
                        {formatPrice(product.price)}
                    </p>

                    {/* Star rating placeholder */}
                    <div className="flex items-center gap-0.5 mb-2.5">
                        {[1, 2, 3, 4].map(i => (
                            <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                        ))}
                        <Star size={12} className="text-amber-400 fill-amber-400 opacity-50" />
                    </div>

                    {/* ADD TO CART button — matches mockup exactly */}
                    <button
                        onClick={handleQuickAdd}
                        disabled={product.stock === 0}
                        className="w-full bg-[#6B7A41] text-white text-xs font-bold tracking-wider uppercase py-2.5 rounded-lg hover:bg-[#5A6836] active:scale-[0.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                        ADD TO CART
                    </button>
                </div>
            </Link>
        </motion.div>
    )
}
