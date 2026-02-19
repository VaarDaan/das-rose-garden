'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'
import Link from 'next/link'

interface Props {
    title: string
    products: Product[]
    viewAllHref?: string
}

export default function HomeSection({ title, products, viewAllHref }: Props) {
    if (!products || products.length === 0) return null

    return (
        <section className="py-4">
            {/* Section header */}
            <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="section-title">{title}</h2>
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="text-xs font-semibold text-[#FF6600] hover:underline"
                    >
                        View All →
                    </Link>
                )}
            </div>

            {/* Horizontal swipeable slider */}
            <Swiper
                modules={[FreeMode]}
                freeMode
                slidesPerView="auto"
                spaceBetween={12}
                className="!px-4"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id} style={{ width: 'auto' }}>
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    )
}
