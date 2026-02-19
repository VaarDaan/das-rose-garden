'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface ProductForm {
    name: string
    description: string
    price: string
    type: string
    flower_color: string
    bloom_season: string
    stock: string
    images: string[]
    size: string[]
    specs: string // JSON string
}

const EMPTY_FORM: ProductForm = {
    name: '', description: '', price: '', type: '', flower_color: '',
    bloom_season: '', stock: '0', images: [], size: [], specs: '{}'
}

const SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'XL']

export default function AdminProductFormPage() {
    const params = useParams()
    const isNew = params.id === 'new'
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
    const [newImage, setNewImage] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (!isNew) {
            supabase.from('products').select('*').eq('id', params.id).single().then(({ data }) => {
                if (data) {
                    setForm({
                        name: data.name || '',
                        description: data.description || '',
                        price: String(data.price || ''),
                        type: data.type || '',
                        flower_color: data.flower_color || '',
                        bloom_season: data.bloom_season || '',
                        stock: String(data.stock || '0'),
                        images: data.images || [],
                        size: data.size || [],
                        specs: JSON.stringify(data.specs || {}, null, 2),
                    })
                }
            })
        }
    }, [params.id])

    const handleSave = async () => {
        if (!form.name || !form.price) { setError('Name and price are required'); return }
        let specs: any = {}
        try { specs = JSON.parse(form.specs) } catch { setError('Invalid JSON in Specs field'); return }
        setSaving(true)
        const payload = {
            name: form.name,
            description: form.description || null,
            price: parseFloat(form.price),
            type: form.type || null,
            flower_color: form.flower_color || null,
            bloom_season: form.bloom_season || null,
            stock: parseInt(form.stock) || 0,
            images: form.images,
            size: form.size,
            specs,
        }
        if (isNew) {
            const { error: e } = await supabase.from('products').insert(payload)
            if (e) { setError(e.message); setSaving(false); return }
        } else {
            const { error: e } = await supabase.from('products').update(payload).eq('id', params.id)
            if (e) { setError(e.message); setSaving(false); return }
        }
        router.push('/admin/products')
    }

    const addImage = () => {
        if (newImage.trim()) { setForm({ ...form, images: [...form.images, newImage.trim()] }); setNewImage('') }
    }
    const removeImage = (i: number) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })
    const toggleSize = (s: string) => setForm({ ...form, size: form.size.includes(s) ? form.size.filter((x) => x !== s) : [...form.size, s] })

    return (
        <div className="p-6 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/products" className="p-2 hover:bg-[#F5F5F5] rounded-lg"><ArrowLeft size={18} /></Link>
                <h1 className="text-2xl font-bold text-[#2E2E2E]">{isNew ? 'Add New Product' : 'Edit Product'}</h1>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>}

            <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
                    <h2 className="font-bold text-[#2E2E2E] mb-4">Basic Info</h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Product Name *</label>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Red Rose Bouquet" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Description</label>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Product description..." className="input-field resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-[#767676] mb-1">Price (₹) *</label>
                                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="599" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#767676] mb-1">Stock</label>
                                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flower Specs */}
                <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
                    <h2 className="font-bold text-[#2E2E2E] mb-4">Flower Specs</h2>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Type</label>
                            <input value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="Roses" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Flower Color</label>
                            <input value={form.flower_color} onChange={(e) => setForm({ ...form, flower_color: e.target.value })} placeholder="Red" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Bloom Season</label>
                            <input value={form.bloom_season} onChange={(e) => setForm({ ...form, bloom_season: e.target.value })} placeholder="Summer" className="input-field" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#767676] mb-1">Available Sizes</label>
                        <div className="flex gap-2 flex-wrap">
                            {SIZE_OPTIONS.map((s) => (
                                <button key={s} type="button" onClick={() => toggleSize(s)}
                                    className={`size-chip ${form.size.includes(s) ? 'selected' : ''}`}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-3">
                        <label className="block text-xs font-semibold text-[#767676] mb-1">Custom Specs (JSON)</label>
                        <textarea
                            value={form.specs}
                            onChange={(e) => setForm({ ...form, specs: e.target.value })}
                            rows={4}
                            placeholder='{"stem_length": "50cm", "fragrance": "Strong"}'
                            className="input-field font-mono text-xs resize-none"
                        />
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
                    <h2 className="font-bold text-[#2E2E2E] mb-4">Images</h2>
                    <div className="flex gap-2 mb-3">
                        <input
                            value={newImage}
                            onChange={(e) => setNewImage(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="input-field flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && addImage()}
                        />
                        <button onClick={addImage} className="btn-primary flex items-center gap-1 shrink-0">
                            <Plus size={14} /> Add
                        </button>
                    </div>
                    {form.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                            {form.images.map((url, i) => (
                                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3">
                        {saving ? 'Saving…' : isNew ? 'Create Product' : 'Update Product'}
                    </button>
                    <Link href="/admin/products" className="btn-ghost flex-1 py-3 text-center">Cancel</Link>
                </div>
            </div>
        </div>
    )
}
