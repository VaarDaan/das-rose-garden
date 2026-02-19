'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Grid, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/lib/store/cartStore'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/categories', label: 'Categories', icon: Grid },
    { href: '/cart', label: 'Cart', icon: ShoppingCart },
    { href: '/profile', label: 'Profile', icon: User },
]

export default function BottomNav() {
    const pathname = usePathname()
    const totalItems = useCartStore((s) => s.totalItems)

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#E8E8E8] safe-area-pb">
            <div className="flex items-center justify-around h-16">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive =
                        href === '/' ? pathname === '/' : pathname.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-150',
                                isActive ? 'text-[#FF6600]' : 'text-[#767676] hover:text-[#2E2E2E]'
                            )}
                        >
                            <div className="relative">
                                <Icon
                                    size={22}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                                {href === '/cart' && totalItems() > 0 && (
                                    <span className="absolute -top-2 -right-2.5 bg-[#FF6600] text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                                        {totalItems() > 99 ? '99+' : totalItems()}
                                    </span>
                                )}
                            </div>
                            <span className={cn('text-[10px] font-medium', isActive ? 'font-semibold' : '')}>
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
