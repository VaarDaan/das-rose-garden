'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItemSnapshot } from '@/lib/types'

interface CartStore {
    items: CartItemSnapshot[]
    addItem: (item: CartItemSnapshot) => void
    removeItem: (productId: string, size?: string | null) => void
    updateQuantity: (productId: string, size: string | null, quantity: number) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (newItem) => {
                set((state) => {
                    const existing = state.items.find(
                        (i) => i.product_id === newItem.product_id && i.size === newItem.size
                    )
                    if (existing) {
                        return {
                            items: state.items.map((i) =>
                                i.product_id === newItem.product_id && i.size === newItem.size
                                    ? { ...i, quantity: i.quantity + newItem.quantity }
                                    : i
                            ),
                        }
                    }
                    return { items: [...state.items, newItem] }
                })
            },

            removeItem: (productId, size) => {
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.product_id === productId && i.size === size)
                    ),
                }))
            },

            updateQuantity: (productId, size, quantity) => {
                if (quantity < 1) {
                    get().removeItem(productId, size)
                    return
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.product_id === productId && i.size === size
                            ? { ...i, quantity }
                            : i
                    ),
                }))
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

            totalPrice: () =>
                get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
        }),
        { name: 'rg-cart' }
    )
)
