import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

interface Props {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: post } = await supabase
        .from('blog_posts')
        .select('title, excerpt')
        .eq('id', id)
        .single()

    if (!post) {
        return {
            title: 'Post Not Found | Das Rose Garden',
        }
    }

    return {
        title: `${post.title} | Das Rose Garden`,
        description: post.excerpt || `Read ${post.title} on Das Rose Garden.`,
    }
}

export default async function BlogPostPage({ params }: Props) {
    const { id } = await params

    const supabase = await createClient()

    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single()

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#FDECEF] pb-12">
            <div className="bg-white/95 backdrop-blur-sm sticky top-[56px] z-40 border-b border-[#D9D4CA]/60 px-4 py-3">
                <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-[#6B7A41] hover:text-[#5A6836] transition-colors">
                    <ArrowLeft size={16} className="mr-1.5" />
                    Back to Journal
                </Link>
            </div>

            <article className="max-w-3xl mx-auto px-4 pt-6">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#2C331F] leading-tight mb-4">
                        {post.title}
                    </h1>
                    <div className="flex items-center text-sm text-[#595959] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Clock size={14} className="mr-1.5" />
                        <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>
                </header>

                {/* Featured Image */}
                {post.image_url && (
                    <div className="mb-10 rounded-2xl overflow-hidden shadow-sm aspect-[16/9]">
                        <img
                            src={post.image_url}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="prose prose-stone prose-lg max-w-none text-[#595959] prose-headings:text-[#2C331F] prose-a:text-[#6B7A41] hover:prose-a:text-[#5A6836]"
                    dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />
            </article>
        </div>
    )
}
