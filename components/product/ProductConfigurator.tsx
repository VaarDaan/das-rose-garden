'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Zap, Minus, Plus, Share2, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
    product: Product
}

export default function ProductConfigurator({ product }: Props) {
    const [selectedSize, setSelectedSize] = useState<string>(product.size?.[0] || '')
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)
    const addItem = useCartStore((s) => s.addItem)
    const router = useRouter()

    const handleAddToCart = () => {
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            size: selectedSize || null,
            image: product.images?.[0] || null,
        })
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
    }

    const handleBuyNow = () => {
        addItem({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity,
            size: selectedSize || null,
            image: product.images?.[0] || null,
        })
        router.push('/checkout')
    }

    return (
        <div className="bg-white">
            {/* Name & price */}
            <div className="px-4 pt-4 pb-3 border-b border-[#E8E8E8]">
                <div className="flex items-start justify-between gap-2">
                    <h1 className="text-xl font-bold text-[#2E2E2E] leading-tight flex-1">{product.name}</h1>
                    <div className="flex gap-1">
                        <button className="p-2 rounded-full hover:bg-[#F5F5F5]"><Heart size={18} className="text-[#767676]" /></button>
                        <button className="p-2 rounded-full hover:bg-[#F5F5F5]"><Share2 size={18} className="text-[#767676]" /></button>
                    </div>
                </div>
                <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-2xl font-bold text-[#FF6600]">{formatPrice(product.price)}</span>
                    {product.stock > 10 ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">In Stock</span>
                    ) : product.stock > 0 ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Few Left</span>
                    ) : (
                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>
                    )}
                </div>
            </div>

            {/* Size selector */}
            {product.size && product.size.length > 0 && (
                <div className="px-4 py-3 border-b border-[#E8E8E8]">
                    <p className="text-xs font-semibold text-[#767676] mb-2">SIZE</p>
                    <div className="flex gap-2 flex-wrap">
                        {product.size.map((s) => (
                            <button
                                key={s}
                                onClick={() => setSelectedSize(s)}
                                className={cn('size-chip', selectedSize === s ? 'selected' : '')}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Quantity */}
            <div className="px-4 py-3 border-b border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#767676] mb-2">QUANTITY</p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-[#E8E8E8] rounded-lg overflow-hidden">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="px-3 py-2 hover:bg-[#F5F5F5] transition-colors"
                        >
                            <Minus size={15} />
                        </button>
                        <span className="px-4 py-2 font-bold text-[#2E2E2E] min-w-[40px] text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            className="px-3 py-2 hover:bg-[#F5F5F5] transition-colors"
                        >
                            <Plus size={15} />
                        </button>
                    </div>
                    <p className="text-xs text-[#767676]">{product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}</p>
                </div>
            </div>

            {/* Product Specs table */}
            <div className="px-4 py-3 border-b border-[#E8E8E8]">
                <p className="text-xs font-semibold text-[#767676] mb-3">PRODUCT DETAILS</p>
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-[#F5F5F5]">
                        {product.type && (
                            <tr>
                                <td className="py-1.5 pr-4 text-[#767676] font-medium w-1/2">Type</td>
                                <td className="py-1.5 text-[#2E2E2E] font-semibold">{product.type}</td>
                            </tr>
                        )}
                        {selectedSize && (
                            <tr>
                                <td className="py-1.5 pr-4 text-[#767676] font-medium">Size</td>
                                <td className="py-1.5 text-[#2E2E2E] font-semibold">{selectedSize}</td>
                            </tr>
                        )}
                        {product.flower_color && (
                            <tr>
                                <td className="py-1.5 pr-4 text-[#767676] font-medium">Flower Color</td>
                                <td className="py-1.5 text-[#2E2E2E] font-semibold">{product.flower_color}</td>
                            </tr>
                        )}
                        {product.bloom_season && (
                            <tr>
                                <td className="py-1.5 pr-4 text-[#767676] font-medium">Bloom Season</td>
                                <td className="py-1.5 text-[#2E2E2E] font-semibold">{product.bloom_season}</td>
                            </tr>
                        )}
                        {product.specs && Object.entries(product.specs).map(([key, value]) => (
                            <tr key={key}>
                                <td className="py-1.5 pr-4 text-[#767676] font-medium capitalize">{key.replace(/_/g, ' ')}</td>
                                <td className="py-1.5 text-[#2E2E2E] font-semibold">{String(value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Description */}
            {product.description && (
                <div className="px-4 py-3 border-b border-[#E8E8E8]">
                    <p className="text-xs font-semibold text-[#767676] mb-2">DESCRIPTION</p>
                    <p className="text-sm text-[#2E2E2E] leading-relaxed">{product.description}</p>
                </div>
            )}

            {/* Sticky CTA footer */}
            <div className="sticky bottom-[64px] left-0 right-0 bg-white border-t border-[#E8E8E8] px-4 py-3 flex gap-3">
                <AnimatePresence mode="wait">
                    <motion.button
                        key={added ? 'added' : 'add'}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className={cn(
                            'flex-1 btn-secondary flex items-center justify-center gap-2',
                            added && 'border-green-500 text-green-600 bg-green-50'
                        )}
                    >
                        <ShoppingCart size={16} />
                        {added ? 'Added!' : 'Add to Cart'}
                    </motion.button>
                </AnimatePresence>
                <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                    <Zap size={16} />
                    Buy Now
                </button>
            </div>
        </div>
    )
}
