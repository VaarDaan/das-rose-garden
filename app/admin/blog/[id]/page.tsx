'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [title, setTitle] = useState('')
    const [excerpt, setExcerpt] = useState('')
    const [content, setContent] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [published, setPublished] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchPost = async () => {
            const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
            if (data) {
                setTitle(data.title)
                setExcerpt(data.excerpt || '')
                setContent(data.content || '')
                setImageUrl(data.image_url || '')
                setPublished(data.published)
            }
            setLoading(false)
        }
        fetchPost()
    }, [id])

    const handleSave = async () => {
        if (!title.trim()) return alert('Title is required')
        setSaving(true)
        const { error } = await supabase.from('blog_posts').update({
            title: title.trim(),
            excerpt: excerpt.trim() || null,
            content: content.trim() || null,
            image_url: imageUrl.trim() || null,
            published,
            updated_at: new Date().toISOString(),
        }).eq('id', id)
        if (error) {
            alert('Error saving: ' + error.message)
            setSaving(false)
            return
        }
        router.push('/admin/blog')
    }

    if (loading) return <div className="p-6"><div className="h-60 bg-[#F9F6EE] rounded-2xl animate-pulse" /></div>

    return (
        <div className="p-6 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/blog" className="p-2 rounded-lg hover:bg-[#F9F6EE] text-[#595959]"><ArrowLeft size={18} /></Link>
                <h1 className="text-2xl font-bold text-[#2C331F]">Edit Blog Post</h1>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-[#2C331F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Title *</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" className="input-field" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[#2C331F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Excerpt</label>
                    <input value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short preview text" className="input-field" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[#2C331F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Image URL</label>
                    <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="input-field" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-[#2C331F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Content</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write your blog post..." rows={12} className="input-field resize-none" />
                </div>
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#6B7A41] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </label>
                    <span className="text-sm font-medium text-[#2C331F]">{published ? 'Published' : 'Draft'}</span>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                        <Save size={16} /> {saving ? 'Saving...' : 'Update Post'}
                    </button>
                    <Link href="/admin/blog" className="btn-secondary">Cancel</Link>
                </div>
            </div>
        </div>
    )
}
