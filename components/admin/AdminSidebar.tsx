'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Image, LayoutGrid, Package, ShoppingBag, Users, BarChart3, Flower2, LogOut, AlertTriangle } from 'lucide-react'
import { adminLogout } from '@/app/admin/login/actions'
import { createClient } from '@/lib/supabase/client'

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/banners', label: 'Hero Banners', icon: Image },
    { href: '/admin/sections', label: 'Home Sections', icon: LayoutGrid },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/users', label: 'Users', icon: Users },
]

interface LowStockProduct {
    id: string
    name: string
    stock: number
}

export default function AdminSidebar() {
    const pathname = usePathname()
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
    const [showLowStock, setShowLowStock] = useState(false)

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const supabase = createClient()
                const { data } = await supabase
                    .from('products')
                    .select('id, name, stock')
                    .lt('stock', 5)
                    .order('stock', { ascending: true })
                setLowStockProducts((data || []) as LowStockProduct[])
            } catch (err) {
                console.error('[AdminSidebar] Failed to fetch low stock:', err)
            }
        }
        fetchLowStock()
        // Re-check every 60 seconds
        const interval = setInterval(fetchLowStock, 60_000)
        return () => clearInterval(interval)
    }, [])

    return (
        <aside className="w-56 shrink-0 bg-[#1A1A2E] min-h-screen flex flex-col">
            {/* Logo */}
            <div className="px-5 py-6 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Flower2 size={22} className="text-[#FF6600]" />
                    <div>
                        <p className="text-xs text-white/40 tracking-widest uppercase">Das</p>
                        <p className="text-sm font-bold text-white leading-tight">Rose Garden</p>
                    </div>
                </div>
                <p className="text-[10px] text-white/30 mt-2 tracking-wider uppercase">Admin Panel</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4">
                {NAV.map(({ href, label, icon: Icon }) => {
                    const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href + '/') || pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all',
                                active
                                    ? 'bg-[#FF6600]/20 text-[#FF6600] border-r-2 border-[#FF6600]'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                            )}
                        >
                            <Icon size={16} />
                            {label}
                        </Link>
                    )
                })}

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                    <div className="mt-3 mx-3">
                        <button
                            onClick={() => setShowLowStock(!showLowStock)}
                            className="flex items-center gap-2 w-full px-2 py-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all text-xs font-semibold"
                        >
                            <AlertTriangle size={14} />
                            <span>Low Stock</span>
                            <span className="ml-auto bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-bold">
                                {lowStockProducts.length}
                            </span>
                        </button>
                        {showLowStock && (
                            <div className="mt-1 space-y-0.5 max-h-40 overflow-y-auto">
                                {lowStockProducts.map((p) => (
                                    <Link
                                        key={p.id}
                                        href={`/admin/products/${p.id}`}
                                        className="flex items-center justify-between px-2 py-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        <span className="text-[11px] truncate max-w-[120px]">{p.name}</span>
                                        <span className={cn(
                                            'text-[10px] font-bold px-1.5 py-0.5 rounded',
                                            p.stock === 0 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                        )}>
                                            {p.stock === 0 ? 'OOS' : `${p.stock} left`}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </nav>

            <div className="px-5 py-4 border-t border-white/10 flex flex-col gap-3">
                <Link href="/" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    ← Back to Store
                </Link>
                <form action={adminLogout}>
                    <button
                        type="submit"
                        className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors w-full"
                    >
                        <LogOut size={13} />
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    )
}
