'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, BookOpen, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/categories', label: 'Shop', icon: ShoppingBag },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/contact', label: 'Contact', icon: MessageCircle },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[#D9D4CA]/60 safe-area-pb">
            <div className="flex items-center justify-around h-14">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive =
                        href === '/' ? pathname === '/' : pathname.startsWith(href)
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-150',
                                isActive ? 'text-[#6B7A41]' : 'text-[#999] hover:text-[#2C331F]'
                            )}
                        >
                            <Icon
                                size={20}
                                strokeWidth={isActive ? 2.5 : 1.8}
                            />
                            <span className={cn('text-[11px]', isActive ? 'font-semibold' : 'font-medium')}>
                                {label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
