import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'

export const metadata: Metadata = {
  title: 'Das Rose Garden — Premium Flowers & Plants',
  description: 'Shop fresh roses, seasonal flowers and premium plants. Free delivery on orders above ₹999.',
  keywords: 'roses, flowers, plants, online flower shop, fresh roses, das rose garden',
  openGraph: {
    title: 'Das Rose Garden',
    description: 'Premium flowers delivered to your door.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
