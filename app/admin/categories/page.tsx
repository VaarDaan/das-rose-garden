'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'
import { Plus, Trash2, GripVertical, ExternalLink, Eye, EyeOff, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ name: '', image_url: '', link: '' })
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true })
        setCategories(data as Category[] || [])
        setLoading(false)
    }

    useEffect(() => { fetchCategories() }, [])

    const uploadFile = async (file: File) => {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        try {
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok) {
                alert(data.error || 'Upload failed')
                setUploading(false)
                return
            }
            setForm(prev => ({ ...prev, image_url: data.url }))
        } catch {
            alert('Upload failed — check your connection')
        }
        setUploading(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0])
            e.target.value = ''
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        if (e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0])
        }
    }

    const handleAdd = async () => {
        if (!form.image_url.trim() || !form.name.trim()) return
        setSaving(true)
        await supabase.from('categories').insert({
            name: form.name,
            image_url: form.image_url,
            link: form.link || null,
            sort_order: categories.length,
            is_featured: true,
        })
        setForm({ name: '', image_url: '', link: '' })
        await fetchCategories()
        setSaving(false)
    }

    const toggleFeatured = async (id: string, current: boolean) => {
        await supabase.from('categories').update({ is_featured: !current }).eq('id', id)
        await fetchCategories()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return
        await supabase.from('categories').delete().eq('id', id)
        await fetchCategories()
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#2E2E2E] mb-1">Featured Categories</h1>
            <p className="text-sm text-[#767676] mb-6">Manage the horizontal scrolling categories list on the home page</p>

            {/* Add form */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 mb-6">
                <h2 className="font-bold text-[#2E2E2E] mb-4">Add New Category</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {/* Upload zone */}
                        {!form.image_url ? (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative h-full flex flex-col justify-center items-center border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${dragOver
                                    ? 'border-[#6B7A41] bg-[#6B7A41]/5'
                                    : 'border-[#E0E0E0] hover:border-[#6B7A41]/50 hover:bg-[#FAFAFA]'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 size={28} className="text-[#6B7A41] animate-spin" />
                                        <p className="text-sm font-medium text-[#6B7A41]">Uploading…</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 rounded-full bg-[#6B7A41]/10 flex items-center justify-center">
                                            <Upload size={22} className="text-[#6B7A41]" />
                                        </div>
                                        <p className="text-sm font-medium text-[#2E2E2E]">
                                            Click to upload or drag & drop
                                        </p>
                                        <p className="text-xs text-[#999]">JPEG, PNG, WebP · 1:1 Square (e.g. 400x400)</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <div className="rounded-full overflow-hidden w-40 h-40 relative group border-4 border-pink-100 shadow-sm">
                                    <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setForm({ ...form, image_url: '' })}
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove image"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Category Name</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Bouquets"
                                className="w-full px-4 py-2 bg-[#F9F6EE] border border-[#E8E4D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B7A41] transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-[#767676] mb-1">Link Destination</label>
                            <input
                                type="text"
                                value={form.link}
                                onChange={(e) => setForm({ ...form, link: e.target.value })}
                                placeholder="e.g. /categories?type=Bouquets"
                                className="w-full px-4 py-2 bg-[#F9F6EE] border border-[#E8E4D9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6B7A41] transition-all"
                            />
                        </div>

                        <button
                            onClick={handleAdd}
                            disabled={saving || !form.image_url || !form.name}
                            className="bg-[#2C331F] text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-[#1A1F12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Plus size={16} /> {saving ? 'Saving…' : 'Add Category'}
                        </button>
                    </div>
                </div>

            </div>

            {/* Categories list */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E8E8E8]">
                    <h2 className="font-bold text-[#2E2E2E]">Current Categories ({categories.length})</h2>
                </div>
                {loading ? (
                    <div className="p-5 space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-[#F5F5F5] animate-pulse" />)}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[#767676]">No categories yet — add one above</div>
                ) : (
                    <AnimatePresence>
                        {categories.map((cat) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-4 px-4 py-4 border-b border-[#F5F5F5] last:border-0 hover:bg-[#FAFAFA]"
                            >
                                <GripVertical size={16} className="text-[#ccc] cursor-grab" />
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F5F5F5] shrink-0 border-2 border-pink-100">
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#2C331F] text-sm">{cat.name}</h3>
                                    {cat.link && (
                                        <p className="text-xs text-[#6B7A41] truncate flex items-center gap-1 mt-1">
                                            <ExternalLink size={10} /> {cat.link}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleFeatured(cat.id, cat.is_featured)}
                                        className={`p-1.5 rounded-lg transition-colors ${cat.is_featured ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        title={cat.is_featured ? 'Hide on Home' : 'Show on Home'}
                                    >
                                        {cat.is_featured ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
                                        className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}
