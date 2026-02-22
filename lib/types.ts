export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Profile {
    id: string
    full_name: string | null
    phone: string | null
    email: string | null
    address: ShippingAddress | null
    created_at: string
}

export interface Product {
    id: string
    name: string
    description: string | null
    price: number
    images: string[]
    type: string | null
    size: string[]
    flower_color: string | null
    bloom_season: string | null
    specs: Record<string, string> | null
    stock: number
    created_at: string
}

export interface CartItem {
    id: string
    user_id: string
    product_id: string
    quantity: number
    size: string | null
    created_at: string
    product?: Product
}

export interface Order {
    id: string
    user_id: string
    items: CartItemSnapshot[]
    total: number
    status: 'received' | 'confirmed' | 'packed' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled'
    payment_method: 'online' | 'cod'
    address: ShippingAddress
    tracking_id: string | null
    courier_name: string | null
    created_at: string
}

export interface CartItemSnapshot {
    product_id: string
    name: string
    price: number
    quantity: number
    size: string | null
    image: string | null
}

export interface ShippingAddress {
    full_name: string
    phone: string
    pincode: string
    address: string
    city: string
    state: string
}

export interface HeroBanner {
    id: string
    image_url: string
    link: string | null
    sort_order: number
    active: boolean
}

export interface HomeSection {
    id: string
    title: string
    product_ids: string[]
    sort_order: number
    active: boolean
}
