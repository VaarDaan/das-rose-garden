import { createServerClient } from '@supabase/ssr'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export const revalidate = 30 // ISR: auto-refresh every 30 seconds

export default async function AdminDashboard() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Safeguard: if env vars are missing, show a helpful message instead of crashing
    if (!supabaseUrl || !serviceRoleKey) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-[#2C331F] mb-1">Dashboard</h1>
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mt-4">
                    <p className="text-sm font-semibold text-red-700 mb-1">⚠️ Configuration Error</p>
                    <p className="text-sm text-red-600">
                        {!supabaseUrl && <span className="block">• <code>NEXT_PUBLIC_SUPABASE_URL</code> is not set.</span>}
                        {!serviceRoleKey && <span className="block">• <code>SUPABASE_SERVICE_ROLE_KEY</code> is not set.</span>}
                    </p>
                    <p className="text-xs text-red-500 mt-2">
                        Add these to your Vercel Environment Variables and redeploy.
                    </p>
                </div>
            </div>
        )
    }

    // Use service role key to bypass RLS — admin dashboard must always see all data
    const supabase = createServerClient(
        supabaseUrl,
        serviceRoleKey,
        { cookies: { getAll: () => [], setAll: () => { } } }
    )

    const [
        { count: productCount },
        { count: orderCount },
        { count: userCount },
        { data: recentOrders },
        { data: lowStockProducts },
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('id, name, stock').lt('stock', 5).order('stock', { ascending: true }),
    ])

    const stats = [
        { label: 'Total Products', value: productCount || 0, color: 'bg-[#6B7A41]/8 border-[#6B7A41]/20', textColor: 'text-[#6B7A41]', emoji: '🌹' },
        { label: 'Total Orders', value: orderCount || 0, color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-600', emoji: '📦' },
        { label: 'Total Users', value: userCount || 0, color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-600', emoji: '👤' },
    ]

    const STATUS_COLORS: Record<string, string> = {
        received: 'bg-gray-100 text-gray-700',
        confirmed: 'bg-blue-100 text-blue-700',
        packed: 'bg-[#6B7A41]/10 text-[#6B7A41]',
        dispatched: 'bg-purple-100 text-purple-700',
        out_for_delivery: 'bg-yellow-100 text-yellow-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#2C331F] mb-1">Dashboard</h1>
            <p className="text-sm text-[#595959] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>Welcome back, Admin</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {stats.map((s) => (
                    <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
                        <p className="text-3xl mb-1">{s.emoji}</p>
                        <p className={`text-3xl font-bold ${s.textColor}`}>{s.value}</p>
                        <p className="text-sm text-[#595959] font-medium mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Low Stock Alerts */}
            {(lowStockProducts && lowStockProducts.length > 0) && (
                <div className="bg-red-50 rounded-2xl border border-red-200 p-5 mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} className="text-red-500" />
                        <h2 className="font-bold text-red-700 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Low Stock Alerts</h2>
                        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-1">
                            {lowStockProducts.length}
                        </span>
                    </div>
                    <div className="space-y-1.5">
                        {lowStockProducts.map((p: any) => (
                            <Link
                                key={p.id}
                                href={`/admin/products/${p.id}`}
                                className="flex items-center justify-between bg-white rounded-lg px-3 py-2 hover:bg-red-100/50 transition-colors"
                            >
                                <span className="text-sm font-medium text-[#2C331F] truncate max-w-[200px]">{p.name}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent orders */}
            <div className="bg-[#F9F6EE] rounded-2xl border border-[#E8E4D9]/60 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E8E4D9]/60">
                    <h2 className="font-bold text-[#2C331F]" style={{ fontFamily: 'Inter, sans-serif' }}>Recent Orders</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-[#FDECEF]">
                        <tr>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-[#595959]" style={{ fontFamily: 'Inter, sans-serif' }}>Order ID</th>
                            <th className="text-left px-3 py-3 text-xs font-semibold text-[#595959]" style={{ fontFamily: 'Inter, sans-serif' }}>Date</th>
                            <th className="text-left px-3 py-3 text-xs font-semibold text-[#595959]" style={{ fontFamily: 'Inter, sans-serif' }}>Status</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-[#595959]" style={{ fontFamily: 'Inter, sans-serif' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E4D9]/60">
                        {(recentOrders || []).map((order: any) => (
                            <tr key={order.id} className="hover:bg-[#FDECEF]/50">
                                <td className="px-5 py-3 font-mono text-xs text-[#2C331F]">
                                    #{`DRG${String(order.order_number).padStart(5, '0')}`}
                                </td>
                                <td className="px-3 py-3 text-[#595959] text-xs">
                                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-3 py-3">
                                    <span className={`badge text-xs ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right font-bold text-[#6B7A41]">
                                    ₹{order.total}
                                </td>
                            </tr>
                        ))}
                        {(!recentOrders || recentOrders.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-5 py-8 text-center text-[#595959] text-sm">No orders yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
