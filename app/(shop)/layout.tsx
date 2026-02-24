import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Footer from '@/components/layout/Footer'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#FDECEF]">
            <Header />
            <main className="pt-[56px] pb-[72px]">
                {children}
            </main>
            <Footer />
            <BottomNav />
        </div>
    )
}
