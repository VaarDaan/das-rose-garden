'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import type { HeroBanner } from '@/lib/types'
import { Flower2 } from 'lucide-react'

interface Props {
    banners: HeroBanner[]
}

// Fallback banners shown when no data in DB
const FALLBACK_BANNERS = [
    {
        id: '1',
        image_url: '',
        link: '/categories',
        gradient: 'from-[#6B7A41] to-[#8A9C5A]',
        headline: '🌹 Fresh Roses, Delivered Daily',
        sub: 'Premium blooms straight from the garden',
    },
    {
        id: '2',
        image_url: '',
        link: '/categories',
        gradient: 'from-rose-400 to-pink-500',
        headline: '🌸 Seasonal Specials',
        sub: 'Up to 30% off on seasonal bouquets',
    },
    {
        id: '3',
        image_url: '',
        link: '/categories',
        gradient: 'from-[#8A9C5A] to-[#2C331F]',
        headline: '🌺 Custom Arrangements',
        sub: 'Handcrafted with love for every occasion',
    },
]

export default function HeroSlider({ banners }: Props) {
    const slides = banners.length > 0 ? banners : null

    return (
        <div className="relative">
            {slides ? (
                <Swiper
                    modules={[Autoplay, Pagination, Navigation]}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop
                    className="h-[220px] sm:h-[300px]"
                >
                    {slides.map((banner) => (
                        <SwiperSlide key={banner.id}>
                            <Link href={banner.link || '/'} className="block h-full">
                                <img
                                    src={banner.image_url}
                                    alt="Banner"
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <Swiper
                    modules={[Autoplay, Pagination]}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    pagination={{ clickable: true }}
                    loop
                    className="h-[220px] sm:h-[300px]"
                >
                    {FALLBACK_BANNERS.map((b) => (
                        <SwiperSlide key={b.id}>
                            <Link
                                href={b.link}
                                className={`flex flex-col items-center justify-center h-full bg-gradient-to-br ${b.gradient} text-white text-center px-8 gap-2`}
                            >
                                <Flower2 size={48} strokeWidth={1.5} className="opacity-80 mb-2" />
                                <h2 className="text-xl sm:text-2xl font-bold drop-shadow text-white">{b.headline}</h2>
                                <p className="text-sm font-medium opacity-90">{b.sub}</p>
                                <span className="mt-3 bg-white/20 backdrop-blur rounded-full px-5 py-1.5 text-sm font-semibold">
                                    Shop Now →
                                </span>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    )
}
