'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Navigation, Pagination } from 'swiper/modules'
import type { SwiperClass } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Flower2 } from 'lucide-react'

interface Props {
    images: string[]
    name: string
}

export default function ProductGallery({ images, name }: Props) {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperClass | null>(null)

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square bg-gradient-to-br from-[#FDECEF] to-[#F9F6EE] flex items-center justify-center">
                <Flower2 size={80} className="text-[#6B7A41] opacity-30" />
            </div>
        )
    }

    return (
        <div>
            {/* Main featured thumbnail */}
            <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                pagination={{ clickable: true }}
                navigation
                className="product-image-container sm:aspect-[4/3] rounded-none sm:rounded-xl overflow-hidden"
            >
                {images.map((url, i) => (
                    <SwiperSlide key={i}>
                        <img src={url} alt={`${name} ${i + 1}`} className="product-image" />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <Swiper
                    onSwiper={setThumbsSwiper}
                    slidesPerView={4}
                    spaceBetween={8}
                    watchSlidesProgress
                    className="mt-3 px-4"
                >
                    {images.map((url, i) => (
                        <SwiperSlide key={i}>
                            <img
                                src={url}
                                alt={`thumb ${i + 1}`}
                                className="w-full aspect-square object-cover rounded-lg cursor-pointer border-2 border-transparent [.swiper-slide-thumb-active_&]:border-[#6B7A41]"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            {/* Gallery Grid (Photos section) */}
            {images.length > 1 && (
                <div className="px-4 pt-4">
                    <h3 className="text-base font-bold text-[#2C331F] mb-3">Photos</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {images.map((url, i) => (
                            <img
                                key={i}
                                src={url}
                                alt={`${name} photo ${i + 1}`}
                                className="w-full aspect-square object-cover rounded-lg"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
