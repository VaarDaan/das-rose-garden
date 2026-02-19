'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'
import ProductCard from '@/components/home/ProductCard'
import { Filter, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPES = ['Roses', 'Seasonal', 'Bouquets', 'Plants', 'Gifts', 'Exotic']
const SIZES = ['Small', 'Medium', 'Large', 'XL']
const COLORS = ['Red', 'Pink', 'White', 'Yellow', 'Orange', 'Purple', 'Mixed']

function CategoriesContent() {
    const searchParams = useSearchParams()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [selectedType, setSelectedType] = useState(searchParams.get('type') || '')
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const supabase = createClient()

    useEffect(() => {
        fetchProducts()
    }, [selectedType, selectedSize, selectedColor, sortBy])

    const fetchProducts = async () => {
        setLoading(true)
        let query = supabase.from('products').select('*')
        if (selectedType) query = query.ilike('type', selectedType)
        if (selectedColor) query = query.ilike('flower_color', selectedColor)
        if (sortBy === 'price_asc') query = query.order('price', { ascending: true })
        else if (sortBy === 'price_desc') query = query.order('price', { ascending: false })
        else query = query.order('created_at', { ascending: false })
        const { data } = await query.limit(40)
        let results = (data || []) as Product[]
        if (selectedSize) results = results.filter((p) => p.size?.includes(selectedSize))
        setProducts(results)
        setLoading(false)
    }

    const clearFilters = () => {
        setSelectedType('')
        setSelectedSize('')
        setSelectedColor('')
    }

    const activeFiltersCount = [selectedType, selectedSize, selectedColor].filter(Boolean).length

    return (
        <div className="min-h-screen bg-white">
            {/* Page header */}
            <div className="sticky top-[64px] z-40 bg-white border-b border-[#E8E8E8] px-4 py-3 flex items-center justify-between">
                <div>
                    <h1 className="text-base font-bold text-[#2E2E2E]">All Products</h1>
                    <p className="text-xs text-[#767676]">{loading ? '…' : `${products.length} items`}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none border border-[#E8E8E8] rounded-lg pl-3 pr-7 py-1.5 text-xs font-medium bg-white text-[#2E2E2E] focus:outline-none focus:border-[#FF6600]"
                        >
                            <option value="newest">Newest</option>
                            <option value="price_asc">Price: Low→High</option>
                            <option value="price_desc">Price: High→Low</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#767676] pointer-events-none" />
                    </div>
                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                            showFilters || activeFiltersCount > 0
                                ? 'border-[#FF6600] text-[#FF6600] bg-orange-50'
                                : 'border-[#E8E8E8] text-[#2E2E2E]'
                        )}
                    >
                        <Filter size={13} />
                        Filter
                        {activeFiltersCount > 0 && (
                            <span className="bg-[#FF6600] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar Filters */}
                {showFilters && (
                    <aside className="w-48 shrink-0 border-r border-[#E8E8E8] p-4 sticky top-[120px] h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-[#2E2E2E]">Filters</span>
                            {activeFiltersCount > 0 && (
                                <button onClick={clearFilters} className="text-xs text-[#FF6600]">
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Type */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-[#767676] mb-2 uppercase tracking-wide">Type</p>
                            {TYPES.map((t) => (
                                <label key={t} className="flex items-center gap-2 py-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="type"
                                        checked={selectedType === t}
                                        onChange={() => setSelectedType(selectedType === t ? '' : t)}
                                        className="accent-[#FF6600]"
                                    />
                                    <span className="text-sm text-[#2E2E2E]">{t}</span>
                                </label>
                            ))}
                        </div>

                        {/* Size */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-[#767676] mb-2 uppercase tracking-wide">Size</p>
                            <div className="flex flex-wrap gap-1.5">
                                {SIZES.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedSize(selectedSize === s ? '' : s)}
                                        className={cn('size-chip text-xs', selectedSize === s ? 'selected' : '')}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Color */}
                        <div className="mb-4">
                            <p className="text-xs font-semibold text-[#767676] mb-2 uppercase tracking-wide">Color</p>
                            {COLORS.map((c) => (
                                <label key={c} className="flex items-center gap-2 py-0.5 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="color"
                                        checked={selectedColor === c}
                                        onChange={() => setSelectedColor(selectedColor === c ? '' : c)}
                                        className="accent-[#FF6600]"
                                    />
                                    <span className="text-sm text-[#2E2E2E]">{c}</span>
                                </label>
                            ))}
                        </div>
                    </aside>
                )}

                {/* Product Grid */}
                <main className="flex-1 p-4">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="rounded-xl bg-[#F5F5F5] animate-pulse aspect-[3/4]" />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <span className="text-5xl mb-3">🌸</span>
                            <p className="text-base font-semibold text-[#2E2E2E]">No products found</p>
                            <p className="text-sm text-[#767676] mt-1">Try adjusting your filters</p>
                            <button onClick={clearFilters} className="btn-secondary mt-4 text-sm">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {products.map((p) => (
                                <div key={p.id} className="w-full">
                                    <ProductCard product={{ ...p }} />
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

// Wrap in Suspense — required by Next.js when using useSearchParams()
export default function CategoriesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-xl bg-[#F5F5F5] animate-pulse aspect-[3/4]" />
                    ))}
                </div>
            </div>
        }>
            <CategoriesContent />
        </Suspense>
    )
}
