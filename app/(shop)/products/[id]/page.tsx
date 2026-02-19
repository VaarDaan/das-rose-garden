import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'
import ProductGallery from '@/components/product/ProductGallery'
import ProductConfigurator from '@/components/product/ProductConfigurator'

export const revalidate = 60

interface Props {
    params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (!product) notFound()

    return (
        <div className="min-h-screen bg-white">
            {/* Gallery */}
            <ProductGallery images={product.images || []} name={product.name} />

            {/* Configurator */}
            <ProductConfigurator product={product as Product} />
        </div>
    )
}
