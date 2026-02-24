import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
    title: 'Garden Journal | Das Rose Garden',
    description: 'Tips, guides, and stories from our garden to yours.',
}

export const revalidate = 60

// Static fallback posts (used when DB is empty)
const STATIC_POSTS = [
    {
        id: 'static-1',
        title: 'Spring Rose Care Tips',
        excerpt: 'Discover the best practices for pruning and fertilizing your roses for a bountiful spring bloom...',
        image_url: null,
        published: true,
        created_at: '2026-02-20T00:00:00Z',
    },
    {
        id: 'static-2',
        title: 'How to Prevent Rose Diseases',
        excerpt: 'Discover the best practices to prevent and treat common rose diseases in your own garden...',
        image_url: null,
        published: true,
        created_at: '2026-02-18T00:00:00Z',
    },
    {
        id: 'static-3',
        title: 'Companion Planting with Roses',
        excerpt: 'Companion planting with roses, with lavender and effective pest control strategies...',
        image_url: null,
        published: true,
        created_at: '2026-02-15T00:00:00Z',
    },
]

const GRADIENTS = [
    'from-rose-300 via-pink-200 to-green-200',
    'from-green-200 to-emerald-100',
    'from-pink-200 to-rose-100',
    'from-amber-100 to-yellow-50',
]
const EMOJIS = ['🌹', '🌿', '🌸', '🪴']

export default async function BlogPage() {
    const supabase = await createClient()
    const { data: posts } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, image_url, published, created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })

    const allPosts = (posts && posts.length > 0) ? posts : STATIC_POSTS
    const featured = allPosts[0]
    const recent = allPosts.slice(1)

    return (
        <div className="min-h-screen bg-[#FDECEF]">
            <div className="px-4 pt-6 pb-2">
                <h1 className="text-3xl font-bold text-[#2C331F]">Our Garden Journal</h1>
            </div>

            <div className="px-4 py-4 space-y-5">
                {/* Featured post */}
                {featured && (
                    <article className="bg-[#F9F6EE] rounded-2xl overflow-hidden shadow-sm">
                        {featured.image_url ? (
                            <div className="aspect-[16/10] overflow-hidden">
                                <img src={featured.image_url} alt={featured.title} className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className={`aspect-[16/10] bg-gradient-to-br ${GRADIENTS[0]} flex items-center justify-center`}>
                                <div className="text-center">
                                    <span className="text-7xl drop-shadow-md">🌹</span>
                                    <p className="text-white text-sm font-semibold mt-2 drop-shadow-sm">Featured Article</p>
                                </div>
                            </div>
                        )}
                        <div className="p-5">
                            <h2 className="text-xl font-bold text-[#2C331F] leading-snug mb-2">{featured.title}</h2>
                            {featured.excerpt && <p className="text-sm text-[#595959] leading-relaxed mb-4">{featured.excerpt}</p>}
                            <Link href={`/blog/${featured.id}`} className="block w-full text-center bg-[#6B7A41] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#5A6836] transition-colors">
                                Read More
                            </Link>
                        </div>
                    </article>
                )}

                {/* Recent Posts */}
                {recent.length > 0 && (
                    <div className="bg-[#F9F6EE] rounded-2xl p-5 shadow-sm">
                        <h3 className="text-xl font-bold text-[#2C331F] mb-4">Recent Posts</h3>
                        <div className="space-y-4">
                            {recent.map((post, i) => (
                                <Link href={`/blog/${post.id}`} key={post.id} className="flex gap-3 group hover:bg-[#f3eedd] p-2 rounded-xl transition-colors -mx-2">
                                    {post.image_url ? (
                                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                                            <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        </div>
                                    ) : (
                                        <div className={`w-20 h-20 rounded-xl shrink-0 bg-gradient-to-br ${GRADIENTS[(i + 1) % GRADIENTS.length]} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                                            <span className="text-3xl">{EMOJIS[(i + 1) % EMOJIS.length]}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <h4 className="text-sm font-bold text-[#2C331F] leading-tight mb-1 group-hover:text-[#6B7A41] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>{post.title}</h4>
                                        {post.excerpt && <p className="text-xs text-[#595959] line-clamp-2 leading-relaxed">{post.excerpt}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-center py-2">
                    <button className="btn-secondary px-8 text-sm">Load More Posts</button>
                </div>
            </div>
        </div>
    )
}
