'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, GripVertical, Link as LinkIcon, Save } from 'lucide-react'

interface FooterLink {
    id?: string
    section: string
    label: string
    url: string
    sort_order: number
    active: boolean
}

const SECTIONS = ['Shop', 'Company', 'Support']

export default function FooterManagerPage() {
    const [links, setLinks] = useState<FooterLink[]>([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [newLink, setNewLink] = useState<FooterLink | null>(null)

    // For MVP, use local state. Later integrate with Supabase footer_links table.
    useEffect(() => {
        // Initialize with default footer links
        const defaults: FooterLink[] = [
            { id: '1', section: 'Shop', label: 'All Products', url: '/categories', sort_order: 1, active: true },
            { id: '2', section: 'Shop', label: 'New Arrivals', url: '/categories?sort=newest', sort_order: 2, active: true },
            { id: '3', section: 'Shop', label: 'Best Sellers', url: '/categories', sort_order: 3, active: true },
            { id: '4', section: 'Shop', label: 'Gift Ideas', url: '/categories?type=Gifts', sort_order: 4, active: true },
            { id: '5', section: 'Company', label: 'About Us', url: '/about', sort_order: 1, active: true },
            { id: '6', section: 'Company', label: 'Our Blog', url: '/blog', sort_order: 2, active: true },
            { id: '7', section: 'Company', label: 'Contact Us', url: '/contact', sort_order: 3, active: true },
            { id: '8', section: 'Support', label: 'My Orders', url: '/orders', sort_order: 1, active: true },
            { id: '9', section: 'Support', label: 'My Profile', url: '/profile', sort_order: 2, active: true },
            { id: '10', section: 'Support', label: 'Shipping Info', url: '/contact', sort_order: 3, active: true },
        ]
        setLinks(defaults)
        setLoading(false)
    }, [])

    const handleDelete = (id: string) => {
        setLinks(links.filter(l => l.id !== id))
    }

    const handleToggle = (id: string) => {
        setLinks(links.map(l => l.id === id ? { ...l, active: !l.active } : l))
    }

    const handleAddLink = () => {
        setNewLink({ section: 'Shop', label: '', url: '', sort_order: links.length + 1, active: true })
    }

    const handleSaveNew = () => {
        if (!newLink || !newLink.label || !newLink.url) return
        setLinks([...links, { ...newLink, id: `new-${Date.now()}` }])
        setNewLink(null)
    }

    if (loading) return <div className="p-6"><div className="h-60 bg-[#F9F6EE] rounded-2xl animate-pulse" /></div>

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#2C331F]">Footer Manager</h1>
                    <p className="text-sm text-[#595959]" style={{ fontFamily: 'Inter, sans-serif' }}>Manage footer navigation links</p>
                </div>
                <button onClick={handleAddLink} className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={16} /> Add Link
                </button>
            </div>

            {/* Add New Link Form */}
            {newLink && (
                <div className="bg-[#6B7A41]/8 rounded-2xl p-4 mb-6 border border-[#6B7A41]/20">
                    <h3 className="font-bold text-[#2C331F] mb-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>New Footer Link</h3>
                    <div className="grid grid-cols-4 gap-3">
                        <select
                            value={newLink.section}
                            onChange={e => setNewLink({ ...newLink, section: e.target.value })}
                            className="input-field text-sm"
                        >
                            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <input
                            value={newLink.label}
                            onChange={e => setNewLink({ ...newLink, label: e.target.value })}
                            placeholder="Link label"
                            className="input-field text-sm"
                        />
                        <input
                            value={newLink.url}
                            onChange={e => setNewLink({ ...newLink, url: e.target.value })}
                            placeholder="/path or https://..."
                            className="input-field text-sm"
                        />
                        <div className="flex gap-2">
                            <button onClick={handleSaveNew} className="btn-primary text-sm px-4">
                                <Save size={14} />
                            </button>
                            <button onClick={() => setNewLink(null)} className="btn-ghost text-sm text-[#595959]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Links by section */}
            {SECTIONS.map(section => {
                const sectionLinks = links.filter(l => l.section === section)
                return (
                    <div key={section} className="mb-6">
                        <h2 className="text-sm font-bold text-[#595959] uppercase tracking-wider mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {section}
                        </h2>
                        <div className="bg-[#F9F6EE] rounded-2xl border border-[#E8E4D9]/60 overflow-hidden">
                            {sectionLinks.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-[#595959]">No links in this section</p>
                            ) : (
                                <div className="divide-y divide-[#E8E4D9]/60">
                                    {sectionLinks.map(link => (
                                        <div key={link.id} className="flex items-center px-4 py-3 gap-3 hover:bg-[#FDECEF]/50 transition-colors">
                                            <GripVertical size={14} className="text-[#B5B5A8] cursor-grab shrink-0" />
                                            <LinkIcon size={14} className="text-[#6B7A41] shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[#2C331F]">{link.label}</p>
                                                <p className="text-xs text-[#595959] truncate">{link.url}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={link.active}
                                                    onChange={() => handleToggle(link.id!)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#6B7A41] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                                            </label>
                                            <button
                                                onClick={() => handleDelete(link.id!)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#595959] hover:text-red-500 transition-colors shrink-0"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}

            <div className="bg-[#F9F6EE] rounded-2xl p-4 border border-[#E8E4D9]/60 text-center">
                <p className="text-xs text-[#595959]">
                    💡 Footer links are displayed in the store footer. Toggle off to hide a link without deleting it.
                </p>
            </div>
        </div>
    )
}
