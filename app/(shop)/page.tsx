import { createClient } from '@/lib/supabase/server'
import HeroSlider from '@/components/home/HeroSlider'
import HomeSection from '@/components/home/HomeSection'
import type { HeroBanner, HomeSection as HomeSectionType, Product } from '@/lib/types'

export const revalidate = 60 // ISR: revalidate every 60 seconds

export default async function HomePage() {
    const supabase = await createClient()

    // Fetch hero banners
    const { data: banners } = await supabase
        .from('hero_banners')
        .select('*')
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
        <div className="bg-white min-h-screen">
            {/* Hero slider */}
            <HeroSlider banners={banners as HeroBanner[] || []} />

            {/* Quick category chips */}
            <div className="px-4 py-4 flex gap-2 overflow-x-auto hide-scrollbar border-b border-[#E8E8E8]">
                {['All', 'Roses', 'Seasonal', 'Bouquets', 'Plants', 'Gifts'].map((cat) => (
                    <a
                        key={cat}
                        href={cat === 'All' ? '/categories' : `/categories?type=${encodeURIComponent(cat)}`}
                        className="flex-shrink-0 px-4 py-1.5 rounded-full border border-[#E8E8E8] text-sm font-medium text-[#2E2E2E] hover:border-[#FF6600] hover:text-[#FF6600] transition-colors first-of-type:border-[#FF6600] first-of-type:text-[#FF6600] first-of-type:bg-orange-50"
                    >
                        {cat}
                    </a>
                ))}
            </div>

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

            {/* Bottom banner */}
            <div className="mx-4 my-6 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 border border-orange-100 p-5 flex flex-col gap-1">
                <p className="text-xs font-semibold text-[#FF6600] uppercase tracking-wider">Why Choose Us</p>
                <h3 className="text-lg font-bold text-[#2E2E2E]">Fresh. Beautiful. Delivered.</h3>
                <div className="grid grid-cols-3 gap-3 mt-3">
                    {[
                        { emoji: '🚚', label: 'Free Delivery', sub: 'Over ₹999' },
                        { emoji: '🌹', label: 'Farm Fresh', sub: 'Daily harvest' },
                        { emoji: '🎁', label: 'Gift Wrap', sub: 'On request' },
                    ].map((f) => (
                        <div key={f.label} className="flex flex-col items-center text-center gap-1">
                            <span className="text-2xl">{f.emoji}</span>
                            <p className="text-xs font-semibold text-[#2E2E2E]">{f.label}</p>
                            <p className="text-[10px] text-[#767676]">{f.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
