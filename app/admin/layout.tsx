import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // Session protection is handled by proxy.ts at the edge.
    // All /admin routes except /admin/login require a valid session cookie.
    return (
        <div className="flex min-h-screen bg-[#F5F5F5]">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    )
}
