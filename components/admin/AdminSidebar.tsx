'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Image, LayoutGrid, Package, ShoppingBag, Users, BarChart3, Flower2, LogOut, AlertTriangle, ChevronDown, Settings, Link as LinkIcon, BookOpen, FileText } from 'lucide-react'
import { adminLogout } from '@/app/admin/login/actions'
import { createClient } from '@/lib/supabase/client'

interface NavSection {
    label: string
    items: { href: string; label: string; icon: React.ComponentType<any> }[]
}

const NAV_SECTIONS: NavSection[] = [
    {
        label: 'Overview',
        items: [
            { href: '/admin', label: 'Dashboard', icon: BarChart3 },
        ],
    },
    {
        label: 'Content Manager',
        items: [
            { href: '/admin/banners', label: 'Hero Banners', icon: Image },
            { href: '/admin/sections', label: 'Home Sections', icon: LayoutGrid },
            { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
            { href: '/admin/footer', label: 'Footer Manager', icon: LinkIcon },
            { href: '/admin/blog', label: 'Blog Manager', icon: BookOpen },
            { href: '/admin/about', label: 'About Us', icon: FileText },
        ],
    },
    {
        label: 'Store Manager',
        items: [
            { href: '/admin/products', label: 'Products', icon: Package },
            { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
            { href: '/admin/users', label: 'Users', icon: Users },
        ],
    },
    {
        label: 'Settings',
        items: [
            { href: '/admin/settings', label: 'Site Settings', icon: Settings },
        ],
    },
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
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'Overview': true,
        'Content Manager': true,
        'Store Manager': true,
        'Settings': true,
    })

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
        const interval = setInterval(fetchLowStock, 60_000)
        return () => clearInterval(interval)
    }, [])

    const toggleSection = (label: string) => {
        setExpandedSections(prev => ({ ...prev, [label]: !prev[label] }))
    }

    return (
        <aside className="w-56 shrink-0 bg-[#F9F6EE] min-h-screen flex flex-col border-r border-[#E8E4D9]/60">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-[#E8E4D9]/60">
                <div className="flex items-center gap-2">
                    <Flower2 size={22} className="text-[#6B7A41]" />
                    <div>
                        <p className="text-[10px] text-[#595959] tracking-widest uppercase font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Das</p>
                        <p className="text-sm font-bold text-[#2C331F] leading-tight font-serif">Rose Garden</p>
                    </div>
                </div>
                <p className="text-[10px] text-[#B5B5A8] mt-2 tracking-wider uppercase font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Admin Panel</p>
            </div>

            {/* Accordion Nav */}
            <nav className="flex-1 py-2 overflow-y-auto">
                {NAV_SECTIONS.map((section) => (
                    <div key={section.label} className="mb-1">
                        {/* Section header (accordion toggle) */}
                        <button
                            onClick={() => toggleSection(section.label)}
                            className="w-full flex items-center justify-between px-5 py-2 text-[10px] font-bold text-[#595959] uppercase tracking-wider hover:text-[#2C331F] transition-colors"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            {section.label}
                            <ChevronDown
                                size={12}
                                className={cn('transition-transform text-[#B5B5A8]', expandedSections[section.label] && 'rotate-180')}
                            />
                        </button>

                        {/* Section items */}
                        {expandedSections[section.label] && (
                            <div className="space-y-0.5">
                                {section.items.map(({ href, label, icon: Icon }) => {
                                    const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href + '/') || pathname === href
                                    return (
                                        <Link
                                            key={href}
                                            href={href}
                                            className={cn(
                                                'flex items-center gap-3 px-5 py-2 text-sm font-medium transition-all mx-2 rounded-lg',
                                                active
                                                    ? 'bg-[#6B7A41]/12 text-[#6B7A41]'
                                                    : 'text-[#595959] hover:text-[#2C331F] hover:bg-[#FDECEF]'
                                            )}
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ))}

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                    <div className="mt-2 mx-3">
                        <button
                            onClick={() => setShowLowStock(!showLowStock)}
                            className="flex items-center gap-2 w-full px-2 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all text-xs font-semibold border border-red-200"
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
                                        className="flex items-center justify-between px-2 py-1.5 rounded-md text-[#595959] hover:text-[#2C331F] hover:bg-[#FDECEF] transition-colors"
                                    >
                                        <span className="text-[11px] truncate max-w-[120px]">{p.name}</span>
                                        <span className={cn(
                                            'text-[10px] font-bold px-1.5 py-0.5 rounded',
                                            p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
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

            <div className="px-5 py-4 border-t border-[#E8E4D9]/60 flex flex-col gap-3">
                <Link href="/" className="text-xs text-[#595959] hover:text-[#2C331F] transition-colors flex items-center gap-1.5">
                    <Flower2 size={12} className="text-[#6B7A41]" /> Back to Store
                </Link>
                <form action={adminLogout}>
                    <button
                        type="submit"
                        className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 transition-colors w-full"
                    >
                        <LogOut size={13} />
                        Sign Out
                    </button>
                </form>
            </div>
        </aside>
    )
}
