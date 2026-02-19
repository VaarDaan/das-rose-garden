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
            <div className="aspect-square bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center">
                <Flower2 size={80} className="text-[#FF6600] opacity-30" />
            </div>
        )
    }

    return (
        <div>
            <Swiper
                modules={[Navigation, Pagination, Thumbs]}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                pagination={{ clickable: true }}
                navigation
                className="aspect-square sm:aspect-[4/3] rounded-none sm:rounded-xl overflow-hidden"
            >
                {images.map((url, i) => (
                    <SwiperSlide key={i}>
                        <img src={url} alt={`${name} ${i + 1}`} className="w-full h-full object-cover" />
                    </SwiperSlide>
                ))}
            </Swiper>

            {images.length > 1 && (
                <Swiper
                    onSwiper={setThumbsSwiper}
                    slidesPerView={4}
                    spaceBetween={8}
                    watchSlidesProgress
                    className="mt-2 px-4"
                >
                    {images.map((url, i) => (
                        <SwiperSlide key={i}>
                            <img
                                src={url}
                                alt={`thumb ${i + 1}`}
                                className="w-full aspect-square object-cover rounded-lg cursor-pointer border-2 border-transparent [.swiper-slide-thumb-active_&]:border-[#FF6600]"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}
        </div>
    )
}
