'use client'

import Link from 'next/link'
import { Flower2, Phone, Mail, MapPin } from 'lucide-react'

const footerLinks = {
    shop: [
        { label: 'All Products', href: '/categories' },
        { label: 'New Arrivals', href: '/categories?sort=newest' },
        { label: 'Best Sellers', href: '/categories' },
        { label: 'Gift Ideas', href: '/categories?type=Gifts' },
    ],
    company: [
        { label: 'About Us', href: '/about' },
        { label: 'Our Blog', href: '/blog' },
        { label: 'Contact Us', href: '/contact' },
    ],
    support: [
        { label: 'My Orders', href: '/orders' },
        { label: 'My Profile', href: '/profile' },
        { label: 'Shipping Info', href: '/contact' },
    ],
}

export default function Footer() {
    return (
        <footer className="bg-[#2C331F] text-white/80 pt-10 pb-24">
            <div className="max-w-5xl mx-auto px-4">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-6">
                    <Flower2 size={24} className="text-[#8A9C5A]" />
                    <span className="font-serif text-lg font-bold text-white tracking-wide">
                        Das Rose Garden
                    </span>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <div>
                        <h4 className="text-xs font-semibold text-[#8A9C5A] uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Shop</h4>
                        <ul className="space-y-2">
                            {footerLinks.shop.map((link) => (
                                <li key={link.href + link.label}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-[#8A9C5A] uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Company</h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold text-[#8A9C5A] uppercase tracking-wider mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Support</h4>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="border-t border-white/10 pt-6 space-y-2.5">
                    <a href="tel:+918250928721" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                        <Phone size={14} className="text-[#8A9C5A]" />
                        +91 82509 28721
                    </a>
                    <a href="mailto:dasshuvankar470@gmail.com" className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
                        <Mail size={14} className="text-[#8A9C5A]" />
                        dasshuvankar470@gmail.com
                    </a>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 mt-6 pt-4">
                    <p className="text-xs text-white/30 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                        © {new Date().getFullYear()} Das Rose Garden. All rights reserved. Premium flowers, delivered fresh.
                    </p>
                </div>
            </div>
        </footer>
    )
}
