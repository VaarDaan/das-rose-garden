'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Image, LayoutGrid, Package, ShoppingBag, Users, BarChart3, Flower2, LogOut } from 'lucide-react'
import { adminLogout } from '@/app/admin/login/actions'

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: BarChart3 },
    { href: '/admin/banners', label: 'Hero Banners', icon: Image },
    { href: '/admin/sections', label: 'Home Sections', icon: LayoutGrid },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/users', label: 'Users', icon: Users },
]

export default function AdminSidebar() {
    const pathname = usePathname()
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
