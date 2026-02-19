import { createClient } from '@/lib/supabase/server'

export default async function AdminDashboard() {
    const supabase = await createClient()

    const [
        { count: productCount },
        { count: orderCount },
        { count: userCount },
        { data: recentOrders },
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
    ])

    const stats = [
        { label: 'Total Products', value: productCount || 0, color: 'bg-orange-50 border-orange-200', textColor: 'text-[#FF6600]', emoji: '🌹' },
        { label: 'Total Orders', value: orderCount || 0, color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-600', emoji: '📦' },
        { label: 'Total Users', value: userCount || 0, color: 'bg-green-50 border-green-200', textColor: 'text-green-600', emoji: '👤' },
    ]

    const STATUS_COLORS: Record<string, string> = {
        confirmed: 'bg-blue-100 text-blue-700',
        processed: 'bg-yellow-100 text-yellow-700',
        shipped: 'bg-purple-100 text-purple-700',
        delivered: 'bg-green-100 text-green-700',
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-[#2E2E2E] mb-1">Dashboard</h1>
            <p className="text-sm text-[#767676] mb-6">Welcome back, Admin</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {stats.map((s) => (
                    <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
                        <p className="text-3xl mb-1">{s.emoji}</p>
                        <p className={`text-3xl font-bold ${s.textColor}`}>{s.value}</p>
                        <p className="text-sm text-[#767676] font-medium mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent orders */}
            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E8E8E8]">
                    <h2 className="font-bold text-[#2E2E2E]">Recent Orders</h2>
                </div>
                <table className="w-full text-sm">
                    <thead className="bg-[#F5F5F5]">
                        <tr>
                            <th className="text-left px-5 py-3 text-xs font-semibold text-[#767676]">Order ID</th>
                            <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Date</th>
                            <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Status</th>
                            <th className="text-right px-5 py-3 text-xs font-semibold text-[#767676]">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5]">
                        {(recentOrders || []).map((order: any) => (
                            <tr key={order.id} className="hover:bg-[#FAFAFA]">
                                <td className="px-5 py-3 font-mono text-xs text-[#2E2E2E]">
                                    #{order.id.slice(0, 8).toUpperCase()}
                                </td>
                                <td className="px-3 py-3 text-[#767676] text-xs">
                                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                                </td>
                                <td className="px-3 py-3">
                                    <span className={`badge text-xs ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right font-bold text-[#FF6600]">
                                    ₹{order.total}
                                </td>
                            </tr>
                        ))}
                        {(!recentOrders || recentOrders.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-5 py-8 text-center text-[#767676] text-sm">No orders yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
