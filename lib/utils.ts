import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

export function generateWhatsAppLink(phone: string, token: string): string {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'
    const text = encodeURIComponent(
        `Verify my Rose Garden account (Code: ${token})`
    )
    return `https://wa.me/${number}?text=${text}`
}

export function generateToken(length = 6): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    return Array.from({ length }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('')
}
