'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HeroBanner } from '@/lib/types'
import { Plus, Trash2, GripVertical, ExternalLink, Eye, EyeOff, Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<HeroBanner[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ image_url: '', link: '' })
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const fetchBanners = async () => {
        const { data } = await supabase
            .from('hero_banners')
            .select('*')
            .order('sort_order', { ascending: true })
        setBanners(data as HeroBanner[] || [])
        setLoading(false)
    }

    useEffect(() => { fetchBanners() }, [])

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
        if (!form.image_url.trim()) return
        setSaving(true)
        await supabase.from('hero_banners').insert({
            image_url: form.image_url,
            link: form.link || null,
            sort_order: banners.length,
            active: true,
        })
        setForm({ image_url: '', link: '' })
        await fetchBanners()
        setSaving(false)
    }

    const toggleActive = async (id: string, current: boolean) => {
        await supabase.from('hero_banners').update({ active: !current }).eq('id', id)
        await fetchBanners()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this banner?')) return
        await supabase.from('hero_banners').delete().eq('id', id)
        await fetchBanners()
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#2E2E2E] mb-1">Hero Banners</h1>
            <p className="text-sm text-[#767676] mb-6">Manage the top hero slider on the home page</p>

            {/* Add form */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] p-5 mb-6">
                <h2 className="font-bold text-[#2E2E2E] mb-4">Add New Banner</h2>

                {/* Upload zone */}
                {!form.image_url ? (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 mb-4 ${dragOver
                            ? 'border-[#FF6600] bg-orange-50/50'
                            : 'border-[#E0E0E0] hover:border-[#FF6600]/50 hover:bg-[#FAFAFA]'
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
                                <p className="text-xs text-[#999]">JPEG, PNG, WebP, GIF · Max 5MB</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mb-4">
                        <div className="rounded-xl overflow-hidden h-36 relative group">
                            <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                onClick={() => setForm({ ...form, image_url: '' })}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                title="Remove image"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <p className="text-[10px] text-[#999] mt-1.5 truncate">{form.image_url}</p>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-xs font-semibold text-[#767676] mb-1">Link (optional)</label>
                    <input
                        type="url"
                        value={form.link}
                        onChange={(e) => setForm({ ...form, link: e.target.value })}
                        placeholder="/categories or https://..."
                        className="input-field"
                    />
                </div>

                <button onClick={handleAdd} disabled={saving || !form.image_url} className="btn-primary flex items-center gap-2">
                    <Plus size={16} /> {saving ? 'Adding…' : 'Add Banner'}
                </button>
            </div>

            {/* Banners list */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E8E8E8]">
                    <h2 className="font-bold text-[#2E2E2E]">Active Banners ({banners.length})</h2>
                </div>
                {loading ? (
                    <div className="p-5 space-y-3">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-[#F5F5F5] animate-pulse" />)}
                    </div>
                ) : banners.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[#767676]">No banners yet — add one above</div>
                ) : (
                    <AnimatePresence>
                        {banners.map((banner) => (
                            <motion.div
                                key={banner.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center gap-3 px-4 py-3 border-b border-[#F5F5F5] last:border-0 hover:bg-[#FAFAFA]"
                            >
                                <GripVertical size={16} className="text-[#ccc] cursor-grab" />
                                <div className="w-24 h-14 rounded-lg overflow-hidden bg-[#F5F5F5] shrink-0">
                                    <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-[#767676] truncate">{banner.image_url}</p>
                                    {banner.link && (
                                        <p className="text-xs text-[#FF6600] truncate flex items-center gap-1">
                                            <ExternalLink size={10} /> {banner.link}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(banner.id, banner.active)}
                                        className={`p-1.5 rounded-lg transition-colors ${banner.active ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        title={banner.active ? 'Deactivate' : 'Activate'}
                                    >
                                        {banner.active ? <Eye size={14} /> : <EyeOff size={14} />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
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
