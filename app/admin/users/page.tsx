import { createClient } from '@/lib/supabase/server'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
    const supabase = await createClient()
    const { data: users } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[#2E2E2E]">Users</h1>
                <p className="text-sm text-[#767676]">{users?.length || 0} registered customers</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
                {!users || users.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users size={40} className="text-[#E8E8E8] mx-auto mb-3" />
                        <p className="text-sm text-[#767676]">No users yet</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-[#F5F5F5]">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-[#767676]">Name</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Phone</th>
                                <th className="text-left px-3 py-3 text-xs font-semibold text-[#767676]">Joined</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-[#767676]">WhatsApp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F5F5F5]">
                            {users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-[#FAFAFA]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-[#FF6600]">
                                                {(user.full_name || user.phone || '?')[0].toUpperCase()}
                                            </div>
                                            <span className="font-medium text-[#2E2E2E]">{user.full_name || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 py-3 font-mono text-sm text-[#767676]">+91 {user.phone}</td>
                                    <td className="px-3 py-3 text-xs text-[#767676]">
                                        {new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <a
                                            href={`https://wa.me/91${user.phone}`}
                                            target="_blank"
                                            className="inline-flex p-2 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                                        >
                                            💬
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
