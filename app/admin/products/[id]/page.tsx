'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface ProductForm {
    product_code: string
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
    product_code: '', name: '', description: '', price: '', type: '', flower_color: '',
    bloom_season: '', stock: '0', images: [], size: [], specs: '{}'
}

const SIZE_OPTIONS = ['Small', 'Medium', 'Large', 'XL']

export default function AdminProductFormPage() {
    const params = useParams()
    const isNew = params.id === 'new'
    const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (!isNew) {
            supabase.from('products').select('*').eq('id', params.id).single().then(({ data }) => {
                if (data) {
                    setForm({
                        product_code: data.product_code || '',
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
            product_code: form.product_code.trim() || null,
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

    const uploadFiles = async (files: FileList | File[]) => {
        setUploading(true)
        setError('')
        const newUrls: string[] = []
        for (const file of Array.from(files)) {
            const formData = new FormData()
            formData.append('file', file)
            try {
                const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
                const data = await res.json()
                if (!res.ok) {
                    setError(data.error || 'Upload failed')
                    continue
                }
                newUrls.push(data.url)
            } catch {
                setError('Upload failed — check your connection')
            }
        }
        if (newUrls.length > 0) {
            setForm(prev => ({ ...prev, images: [...prev.images, ...newUrls] }))
        }
        setUploading(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            uploadFiles(e.target.files)
            e.target.value = '' // reset so same file can be re-selected
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files.length > 0) {
            uploadFiles(e.dataTransfer.files)
        }
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
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Product Code</label>
                            <input value={form.product_code} onChange={(e) => setForm({ ...form, product_code: e.target.value })} placeholder="DRG-ROSE-001" className="input-field font-mono" />
                        </div>
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

                {/* Images — Upload from device */}
                <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5">
                    <h2 className="font-bold text-[#2E2E2E] mb-4">Images</h2>

                    {/* Upload zone */}
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${dragOver
                            ? 'border-[#FF6600] bg-orange-50/50'
                            : 'border-[#E0E0E0] hover:border-[#FF6600]/50 hover:bg-[#FAFAFA]'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 size={28} className="text-[#FF6600] animate-spin" />
                                <p className="text-sm font-medium text-[#FF6600]">Uploading…</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
                                    <Upload size={22} className="text-[#FF6600]" />
                                </div>
                                <p className="text-sm font-medium text-[#2E2E2E]">
                                    Click to upload or drag & drop
                                </p>
                                <p className="text-xs text-[#999]">JPEG, PNG, WebP, GIF · Max 5MB each</p>
                            </div>
                        )}
                    </div>

                    {/* Add Image by URL */}
                    <div className="mt-4 flex gap-2">
                        <input
                            type="url"
                            id="image-url-input"
                            placeholder="Paste image URL (https://...)"
                            className="input-field flex-1"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    const input = e.currentTarget
                                    const url = input.value.trim()
                                    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                                        setForm(prev => ({ ...prev, images: [...prev.images, url] }))
                                        input.value = ''
                                        setError('')
                                    } else if (url) {
                                        setError('Please enter a valid URL starting with http:// or https://')
                                    }
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const input = document.getElementById('image-url-input') as HTMLInputElement
                                const url = input?.value?.trim()
                                if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                                    setForm(prev => ({ ...prev, images: [...prev.images, url] }))
                                    input.value = ''
                                    setError('')
                                } else if (url) {
                                    setError('Please enter a valid URL starting with http:// or https://')
                                }
                            }}
                            className="btn-primary px-4 py-2 text-sm whitespace-nowrap bg-[#2C331F] text-white hover:bg-[#3A4329] rounded-xl"
                        >
                            <Plus size={16} className="inline mr-1" /> Add URL
                        </button>
                    </div>

                    {/* Image grid */}
                    {form.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            {form.images.map((url, i) => (
                                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-[#F5F5F5]">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <X size={12} />
                                    </button>
                                    {i === 0 && (
                                        <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                            MAIN
                                        </span>
                                    )}
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
