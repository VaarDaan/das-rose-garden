'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { HeroBanner } from '@/lib/types'
import { Plus, Trash2, GripVertical, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<HeroBanner[]>([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({ image_url: '', link: '' })
    const [saving, setSaving] = useState(false)
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
                <div className="grid grid-cols-1 gap-3 mb-4">
                    <div>
                        <label className="block text-xs font-semibold text-[#767676] mb-1">Image URL *</label>
                        <input
                            type="url"
                            value={form.image_url}
                            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                            placeholder="https://example.com/image.jpg"
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-[#767676] mb-1">Link (optional)</label>
                        <input
                            type="url"
                            value={form.link}
                            onChange={(e) => setForm({ ...form, link: e.target.value })}
                            placeholder="/categories or https://..."
                            className="input-field"
                        />
                    </div>
                </div>

                {/* Preview */}
                {form.image_url && (
                    <div className="mb-4 rounded-xl overflow-hidden h-32">
                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                )}

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
