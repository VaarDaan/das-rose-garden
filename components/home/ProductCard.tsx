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
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="card bg-white overflow-hidden group flex-shrink-0 w-[160px] sm:w-[180px]"
        >
            <Link href={`/products/${product.id}`} className="block">
                {/* Image */}
                <div className="relative aspect-square bg-[#F9F0EC] overflow-hidden">
                    {product.images?.[0] ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Flower2 size={40} className="text-[#FF6600] opacity-40" />
                        </div>
                    )}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white text-[#2E2E2E] text-xs font-semibold px-2 py-0.5 rounded">
                                Out of Stock
                            </span>
                        </div>
                    )}
                    {product.type && (
                        <span className="absolute top-2 left-2 badge-orange text-[10px]">
                            {product.type}
                        </span>
                    )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                    <p className="text-xs font-semibold text-[#2E2E2E] line-clamp-2 leading-tight mb-1">
                        {product.name}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-[#FF6600]">
                            {formatPrice(product.price)}
                        </span>
                        <button
                            onClick={handleQuickAdd}
                            disabled={product.stock === 0}
                            className="p-1.5 rounded-lg bg-[#FF6600] text-white hover:bg-[#e55a00] active:scale-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add to cart"
                        >
                            <ShoppingCart size={13} />
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    )
}
