'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
        setProducts(data as Product[] || [])
        setLoading(false)
    }

    useEffect(() => { fetchProducts() }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product? This cannot be undone.')) return
        await supabase.from('products').delete().eq('id', id)
        await fetchProducts()
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#2E2E2E]">Products</h1>
                    <p className="text-sm text-[#767676]">{products.length} total products</p>
                </div>
                <Link href="/admin/products/new" className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> Add Product
                </Link>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                {loading ? (
                    <div className="p-5 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-[#F5F5F5] rounded-xl animate-pulse" />)}</div>
                ) : products.length === 0 ? (
                    <div className="py-20 text-center">
                        <Package size={40} className="text-[#E8E8E8] mx-auto mb-3" />
                        <p className="text-sm text-[#767676]">No products yet</p>
                        <Link href="/admin/products/new" className="btn-primary inline-flex items-center gap-2 mt-4">
                            <Plus size={16} /> Add Your First Product
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-[#F5F5F5]">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#767676]">Product</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Type</th>
                                <th className="text-right px-3 py-3 text-xs font-semibold text-[#767676]">Price</th>
                                <th className="text-right px-3 py-3 text-xs font-semibold text-[#767676]">Stock</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-[#767676]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F5F5]">
                            {products.map((p) => (
                                <tr key={p.id} className="hover:bg-[#FAFAFA]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F9F0EC] shrink-0">
                                                {p.images?.[0] ? (
                                                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#FF6600]">🌹</div>
                                                )}
                                            </div>
                                            <p className="font-medium text-[#2E2E2E] line-clamp-1">{p.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 text-[#767676]">{p.type || '—'}</td>
                                    <td className="px-3 py-3 text-right font-bold text-[#FF6600]">{formatPrice(p.price)}</td>
                                    <td className="px-3 py-3 text-right">
                                        <span className={`badge ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/products/${p.id}`} className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                                                <Edit2 size={14} />
                                            </Link>
                                            <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
