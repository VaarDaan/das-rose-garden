'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Menu, X, Flower2, User, Package, MessageCircle, ShoppingBag, BookOpen } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
type SearchProduct = Pick<import('@/lib/types').Product, 'id' | 'name' | 'price' | 'images' | 'type'>

export default function Header() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchProduct[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [loading, setLoading] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const totalItems = useCartStore((s) => s.totalItems)
    const router = useRouter()

    const search = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); setShowDropdown(false); return }
        setLoading(true)
        const supabase = createClient()
        const pattern = `%${q.trim()}%`
        const { data } = await supabase
            .from('products')
            .select('id, name, price, images, type')
            .or(`name.ilike.${pattern},type.ilike.${pattern},flower_color.ilike.${pattern}`)
            .limit(6)
        setResults((data || []) as SearchProduct[])
        setShowDropdown(true)
        setLoading(false)
    }, [])

    useEffect(() => {
        const t = setTimeout(() => search(query), 300)
        return () => clearTimeout(t)
    }, [query, search])

    // Lock body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [menuOpen])

    const menuLinks = [
        { href: '/profile', label: 'Profile', icon: User },
        { href: '/orders', label: 'Orders', icon: Package },
        { href: '/contact', label: 'Contact Us', icon: MessageCircle },
        { href: '/categories', label: 'See All Products', icon: ShoppingBag },
        { href: '/blog', label: 'See Blogs', icon: BookOpen },
    ]

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#D9D4CA]/60">
                {/* Main bar */}
                <div className="flex items-center justify-between px-4 py-3">
                    {/* Left: Menu */}
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="p-1.5 rounded-lg hover:bg-[#F9F6EE] transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={22} className="text-[#2C331F]" />
                    </button>

                    {/* Center: Logo */}
                    <Link href="/" className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                        <Flower2 size={22} className="text-[#6B7A41]" strokeWidth={2} />
                        <span className="font-serif text-base font-bold text-[#2C331F] tracking-wide whitespace-nowrap">
                            Das Rose Garden
                        </span>
                    </Link>

                    {/* Right: Search + Cart */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-1.5 rounded-lg hover:bg-[#F9F6EE] transition-colors"
                        >
                            <Search size={20} className="text-[#2C331F]" />
                        </button>
                        <Link href="/cart" className="relative p-1.5 rounded-lg hover:bg-[#F9F6EE] transition-colors">
                            <ShoppingCart size={20} className="text-[#2C331F]" />
                            {totalItems() > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-[#6B7A41] text-white text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                                    {totalItems() > 9 ? '9+' : totalItems()}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Expandable Search Bar */}
                {showSearch && (
                    <div className="px-4 pb-3 relative">
                        <div className="flex items-center bg-[#F9F6EE] rounded-xl px-3 gap-2 border border-[#D9D4CA] focus-within:border-[#6B7A41] transition-all">
                            <Search size={16} className="text-[#595959] shrink-0" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search roses, plants..."
                                className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-[#999] text-[#2C331F]"
                                autoFocus
                            />
                            {query && (
                                <button onClick={() => { setQuery(''); setShowDropdown(false) }}>
                                    <X size={14} className="text-[#595959]" />
                                </button>
                            )}
                        </div>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-xl border border-[#D9D4CA] shadow-xl z-50 overflow-hidden">
                                {loading ? (
                                    <div className="px-4 py-3 text-sm text-[#595959]">Searching…</div>
                                ) : results.length === 0 ? (
                                    <div className="px-4 py-3 text-sm text-[#595959]">No products found</div>
                                ) : (
                                    results.map((p) => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                router.push(`/products/${p.id}`)
                                                setShowDropdown(false)
                                                setQuery('')
                                                setShowSearch(false)
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#F9F6EE] text-left"
                                        >
                                            {p.images?.[0] ? (
                                                <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-[#F9F6EE] flex items-center justify-center">
                                                    <Flower2 size={16} className="text-[#6B7A41]" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-medium text-[#2C331F] line-clamp-1">{p.name}</p>
                                                <p className="text-xs text-[#595959]">{p.type}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* ── Slide-out Menu Drawer ─────────────────────────── */}
            {/* Backdrop */}
            <div
                className={cn(
                    'fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300',
                    menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                )}
                onClick={() => setMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <div
                className={cn(
                    'fixed top-0 left-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col',
                    menuOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E4D9]/60">
                    <div className="flex items-center gap-2">
                        <Flower2 size={20} className="text-[#6B7A41]" />
                        <span className="font-serif text-base font-bold text-[#2C331F]">Das Rose Garden</span>
                    </div>
                    <button
                        onClick={() => setMenuOpen(false)}
                        className="p-1.5 rounded-lg hover:bg-[#F9F6EE] transition-colors"
                        aria-label="Close menu"
                    >
                        <X size={20} className="text-[#595959]" />
                    </button>
                </div>

                {/* Menu Links */}
                <nav className="flex-1 overflow-y-auto py-3">
                    {menuLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3.5 px-5 py-3.5 text-[#2C331F] hover:bg-[#F9F6EE] transition-colors"
                        >
                            <Icon size={20} className="text-[#6B7A41]" strokeWidth={1.8} />
                            <span className="text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>
                        </Link>
                    ))}
                </nav>

                {/* Drawer Footer */}
                <div className="px-5 py-4 border-t border-[#E8E4D9]/60">
                    <p className="text-[10px] text-[#999]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        © {new Date().getFullYear()} Das Rose Garden
                    </p>
                </div>
            </div>
        </>
    )
}
