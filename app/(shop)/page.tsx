import { createClient } from '@/lib/supabase/server'
import HeroSlider from '@/components/home/HeroSlider'
import HomeSection from '@/components/home/HomeSection'
import type { HeroBanner, HomeSection as HomeSectionType, Product } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function HomePage() {
    const supabase = await createClient()

    // Fetch hero banners
    const { data: banners } = await supabase
        .from('hero_banners')
        .select('*')
        .order('sort_order', { ascending: true })

    // Fetch featured categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('is_featured', true)
        .order('sort_order', { ascending: true })

    // Fetch home sections
    const { data: sections } = await supabase
        .from('home_sections')
        .select('*')
        .order('sort_order', { ascending: true })

    // Gather all product IDs needed across sections
    const allProductIds = (sections || []).flatMap((s: HomeSectionType) => s.product_ids || [])

    let productsMap: Record<string, Product> = {}
    if (allProductIds.length > 0) {
        const { data: products } = await supabase
            .from('products')
            .select('*')
            .in('id', allProductIds)
            ; (products || []).forEach((p: Product) => {
                productsMap[p.id] = p
            })
    }

    // Also fetch some "New Arrivals" fallback products
    const { data: newArrivals } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

    return (
        <div className="bg-[#FDECEF] min-h-screen">
            {/* Hero slider */}
            <HeroSlider banners={banners as HeroBanner[] || []} />

            {/* Featured Categories — Horizontal Scroll */}
            {categories && categories.length > 0 && (
                <div className="py-6 bg-white border-b border-[#E8E4D9]/60">
                    <h2 className="section-title text-center mb-5">Featured Categories</h2>
                    <div className="flex overflow-x-auto hide-scrollbar px-4 pb-4 gap-6 snap-x snap-mandatory">
                        {categories.map((cat: any) => (
                            <Link
                                key={cat.id}
                                href={cat.link || '#'}
                                className="flex flex-col items-center gap-3 group shrink-0 snap-start"
                            >
                                <div className="w-24 h-24 rounded-full bg-pink-100 p-1 flex items-center justify-center group-hover:bg-[#6B7A41] transition-colors shadow-sm relative">
                                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white relative z-10 group-hover:scale-[1.03] transition-transform duration-300">
                                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute inset-0 rounded-full shadow-inner opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none" />
                                </div>
                                <span className="text-sm font-semibold text-[#2C331F] group-hover:text-[#6B7A41] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Dynamic sections from DB */}
            {(sections || []).map((section: HomeSectionType) => {
                const products = (section.product_ids || [])
                    .map((id) => productsMap[id])
                    .filter(Boolean) as Product[]
                return (
                    <HomeSection
                        key={section.id}
                        title={section.title}
                        products={products}
                        viewAllHref="/categories"
                    />
                )
            })}

            {/* New Arrivals fallback section */}
            {(newArrivals && newArrivals.length > 0) && (
                <HomeSection
                    title="New Arrivals"
                    products={newArrivals as Product[]}
                    viewAllHref="/categories"
                />
            )}

            {/* Bottom banner — Why Choose Us */}
            <div className="mx-4 my-6 rounded-2xl bg-[#F9F6EE] border border-[#E8E4D9] p-5 flex flex-col gap-1">
                <p className="text-xs font-semibold text-[#6B7A41] uppercase tracking-wider" style={{ fontFamily: 'Inter, sans-serif' }}>Why Choose Us</p>
                <h3 className="text-lg font-bold text-[#2C331F]">Fresh. Beautiful. Delivered.</h3>
                <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                        { emoji: '🚚', label: 'Free Delivery', sub: 'Over ₹999' },
                        { emoji: '🌹', label: 'Farm Fresh', sub: 'Daily harvest' },
                        { emoji: '🎁', label: 'Gift Wrap', sub: 'On request' },
                    ].map((f) => (
                        <div key={f.label} className="flex flex-col items-center text-center gap-1">
                            <span className="text-2xl">{f.emoji}</span>
                            <p className="text-xs font-semibold text-[#2C331F]" style={{ fontFamily: 'Inter, sans-serif' }}>{f.label}</p>
                            <p className="text-[10px] text-[#595959]">{f.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
