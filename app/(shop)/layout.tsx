import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <Header />
            <main className="pt-[64px] pb-[72px]">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}
