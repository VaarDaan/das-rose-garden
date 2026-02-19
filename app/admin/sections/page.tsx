'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HomeSection, Product } from '@/lib/types'
import { Plus, Trash2, Eye, EyeOff, ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminSectionsPage() {
    const [sections, setSections] = useState<HomeSection[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ title: '' })
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])
    const [saving, setSaving] = useState(false)
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const supabase = createClient()

    const fetchData = async () => {
        const [{ data: sects }, { data: prods }] = await Promise.all([
            supabase.from('home_sections').select('*').order('sort_order'),
            supabase.from('products').select('id, name, images, price').order('created_at', { ascending: false }).limit(50),
        ])
        setSections(sects as HomeSection[] || [])
        setProducts(prods as Product[] || [])
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const handleAdd = async () => {
        if (!form.title.trim()) return
        setSaving(true)
        await supabase.from('home_sections').insert({
            title: form.title,
            product_ids: selectedProducts,
            sort_order: sections.length,
            active: true,
        })
        setForm({ title: '' })
        setSelectedProducts([])
        await fetchData()
        setSaving(false)
    }

    const toggleProduct = (id: string) => {
        setSelectedProducts((prev) =>
            prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
        )
    }

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from('home_sections').update({ active: !current }).eq('id', id)
        await fetchData()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this section?')) return
        await supabase.from('home_sections').delete().eq('id', id)
        await fetchData()
    }

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(productSearchTerm.toLowerCase())
    )

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#2E2E2E] mb-1">Home Sections</h1>
            <p className="text-sm text-[#767676] mb-6">Create and manage dynamic product rows on the home page</p>

            {/* Add form */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 mb-6">
                <h2 className="font-bold text-[#2E2E2E] mb-4">Create New Section</h2>
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-[#767676] mb-1">Section Title *</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ title: e.target.value })}
                        placeholder='e.g. "Best Sellers" or "Seasonal Picks"'
                        className="input-field"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-semibold text-[#767676] mb-1">
                        Select Products ({selectedProducts.length} selected)
                    </label>
                    <input
                        type="text"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                        placeholder="Search products..."
                        className="input-field mb-2"
                    />
                    <div className="border border-[#E8E8E8] rounded-xl max-h-40 overflow-y-auto">
                        {filteredProducts.map((p) => (
                            <label
                                key={p.id}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-[#F5F5F5] cursor-pointer border-b border-[#F5F5F5] last:border-0"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(p.id)}
                                    onChange={() => toggleProduct(p.id)}
                                    className="accent-[#FF6600]"
                                />
                                {p.images?.[0] && (
                                    <img src={p.images[0]} alt="" className="w-7 h-7 rounded object-cover" />
                                )}
                                <span className="text-sm text-[#2E2E2E] flex-1">{p.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {selectedProducts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {selectedProducts.map((id) => {
                            const p = products.find((x) => x.id === id)
                            return p ? (
                                <span key={id} className="badge bg-orange-100 text-[#FF6600] flex items-center gap-1 text-xs py-1 pl-2 pr-1">
                                    {p.name.slice(0, 20)}{p.name.length > 20 ? '…' : ''}
                                    <button onClick={() => toggleProduct(id)}><X size={10} /></button>
                                </span>
                            ) : null
                        })}
                    </div>
                )}

                <button onClick={handleAdd} disabled={saving || !form.title} className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> {saving ? 'Saving…' : 'Create Section'}
                </button>
            </div>

            {/* Sections list */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E8E8E8]">
                    <h2 className="font-bold text-[#2E2E2E]">Sections ({sections.length})</h2>
                </div>
                {loading ? (
                    <div className="p-5 space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-[#F5F5F5] animate-pulse" />)}
                    </div>
                ) : sections.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[#767676]">No sections yet — create one above</div>
                ) : (
                    sections.map((section) => (
                        <div key={section.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#F5F5F5] last:border-0 hover:bg-[#FAFAFA]">
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-[#2E2E2E]">{section.title}</p>
                                <p className="text-xs text-[#767676]">{section.product_ids?.length || 0} products</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleActive(section.id, section.active)}
                                    className={`p-1.5 rounded-lg ${section.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    {section.active ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                                <button onClick={() => handleDelete(section.id)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
