'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, User, Flower2, X } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
type SearchProduct = Pick<import('@/lib/types').Product, 'id' | 'name' | 'price' | 'images' | 'type'>

export default function Header() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchProduct[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)
    const totalItems = useCartStore((s) => s.totalItems)
    const router = useRouter()

    const search = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); setShowDropdown(false); return }
        setLoading(true)
        const supabase = createClient()
        const { data } = await supabase
            .from('products')
            .select('id, name, price, images, type')
            .ilike('name', `%${q}%`)
            .limit(6)
        setResults((data || []) as SearchProduct[])
        setShowDropdown(true)
        setLoading(false)
    }, [])

    useEffect(() => {
        const t = setTimeout(() => search(query), 300)
        return () => clearTimeout(t)
    }, [query, search])

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E8E8E8] shadow-sm">
            {/* Top bar */}
            <div className="flex items-center gap-3 px-4 py-3">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1.5 shrink-0">
                    <Flower2 size={26} className="text-[#FF6600]" strokeWidth={2.5} />
                    <div className="leading-tight">
                        <p className="text-[10px] font-medium text-[#767676] tracking-widest uppercase">Das</p>
                        <p className="text-base font-bold text-[#2E2E2E] -mt-0.5 leading-none">Rose Garden</p>
                    </div>
                </Link>

                {/* Search */}
                <div className="relative flex-1">
                    <div className="flex items-center bg-[#F5F5F5] rounded-lg px-3 gap-2 border border-transparent focus-within:border-[#FF6600] focus-within:bg-white transition-all">
                        <Search size={16} className="text-[#767676] shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search roses, plants..."
                            className="flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-[#aaa]"
                        />
                        {query && (
                            <button onClick={() => { setQuery(''); setShowDropdown(false) }}>
                                <X size={14} className="text-[#767676]" />
                            </button>
                        )}
                    </div>

                    {/* Dropdown */}
                    {showDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#E8E8E8] shadow-xl z-50 overflow-hidden">
                            {loading ? (
                                <div className="px-4 py-3 text-sm text-[#767676]">Searching…</div>
                            ) : results.length === 0 ? (
                                <div className="px-4 py-3 text-sm text-[#767676]">No products found</div>
                            ) : (
                                results.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => {
                                            router.push(`/products/${p.id}`)
                                            setShowDropdown(false)
                                            setQuery('')
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#F5F5F5] text-left"
                                    >
                                        {p.images?.[0] ? (
                                            <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center">
                                                <Flower2 size={14} className="text-[#FF6600]" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-[#2E2E2E] line-clamp-1">{p.name}</p>
                                            <p className="text-xs text-[#767676]">{p.type}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Cart & Profile */}
                <div className="flex items-center gap-1">
                    <Link href="/cart" className="relative p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors">
                        <ShoppingCart size={22} className="text-[#2E2E2E]" />
                        {totalItems() > 0 && (
                            <span className="absolute top-0 right-0 bg-[#FF6600] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {totalItems() > 9 ? '9+' : totalItems()}
                            </span>
                        )}
                    </Link>
                    <Link href="/profile" className="p-2 rounded-lg hover:bg-[#F5F5F5] transition-colors">
                        <User size={22} className="text-[#2E2E2E]" />
                    </Link>
                </div>
            </div>
        </header>
    )
}
