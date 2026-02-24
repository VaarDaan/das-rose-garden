'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface BlogPost {
    id: string
    title: string
    excerpt: string | null
    content: string | null
    image_url: string | null
    published: boolean
    created_at: string
    updated_at: string
}

export default function BlogManagerPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchPosts = async () => {
        const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
        setPosts(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchPosts() }, [])

    const togglePublish = async (id: string, published: boolean) => {
        await supabase.from('blog_posts').update({ published: !published, updated_at: new Date().toISOString() }).eq('id', id)
        fetchPosts()
    }

    const deletePost = async (id: string) => {
        if (!confirm('Delete this blog post?')) return
        await supabase.from('blog_posts').delete().eq('id', id)
        fetchPosts()
    }

    if (loading) return <div className="p-6"><div className="h-60 bg-[#F9F6EE] rounded-2xl animate-pulse" /></div>

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#2C331F]">Blog Manager</h1>
                    <p className="text-sm text-[#595959]" style={{ fontFamily: 'Inter, sans-serif' }}>Create and manage blog posts</p>
                </div>
                <Link href="/admin/blog/new" className="btn-primary flex items-center gap-2 text-sm">
                    <Plus size={16} /> New Post
                </Link>
            </div>

            {posts.length === 0 ? (
                <div className="bg-[#F9F6EE] rounded-2xl p-12 text-center">
                    <BookOpen size={40} className="text-[#6B7A41] opacity-30 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-[#2C331F]">No blog posts yet</p>
                    <p className="text-xs text-[#595959] mt-1">Create your first post to get started</p>
                    <Link href="/admin/blog/new" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm">
                        <Plus size={14} /> Create Post
                    </Link>
                </div>
            ) : (
                <div className="bg-[#F9F6EE] rounded-2xl border border-[#E8E4D9]/60 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#FDECEF]/60 text-left">
                                <th className="px-4 py-3 text-xs font-bold text-[#595959] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Title</th>
                                <th className="px-4 py-3 text-xs font-bold text-[#595959] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Status</th>
                                <th className="px-4 py-3 text-xs font-bold text-[#595959] uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>Date</th>
                                <th className="px-4 py-3 text-xs font-bold text-[#595959] uppercase text-right" style={{ fontFamily: 'Inter, sans-serif' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E4D9]/60">
                            {posts.map(post => (
                                <tr key={post.id} className="hover:bg-[#FDECEF]/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-semibold text-[#2C331F]">{post.title}</p>
                                        {post.excerpt && <p className="text-xs text-[#595959] line-clamp-1 mt-0.5">{post.excerpt}</p>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => togglePublish(post.id, post.published)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${post.published
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                                }`}
                                        >
                                            {post.published ? <Eye size={12} /> : <EyeOff size={12} />}
                                            {post.published ? 'Published' : 'Draft'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-[#595959]">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/admin/blog/${post.id}`}
                                                className="p-1.5 rounded-lg hover:bg-[#6B7A41]/10 text-[#6B7A41] transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </Link>
                                            <button
                                                onClick={() => deletePost(post.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-[#595959] hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
