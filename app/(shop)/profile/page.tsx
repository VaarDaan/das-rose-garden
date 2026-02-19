'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Phone, Package, LogOut, ChevronRight, Flower2 } from 'lucide-react'
import Link from 'next/link'
import type { Profile } from '@/lib/types'

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetch = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }
            const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            setProfile(data as Profile)
            setLoading(false)
        }
        fetch()
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    if (loading) {
        return <div className="px-4 py-8 space-y-4">
            <div className="h-32 rounded-2xl bg-[#F5F5F5] animate-pulse" />
            <div className="h-16 rounded-xl bg-[#F5F5F5] animate-pulse" />
        </div>
    }

    if (!profile) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
                <Flower2 size={48} className="text-[#FF6600] opacity-30 mb-3" />
                <p className="text-base font-semibold text-[#2E2E2E] mb-4">Sign in to view your profile</p>
                <Link href="/login" className="btn-primary">Sign In</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            {/* Profile header */}
            <div className="bg-gradient-to-br from-[#FF6600] to-rose-500 px-4 py-8 flex flex-col items-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-3">
                    <User size={36} className="text-white" />
                </div>
                <h1 className="text-xl font-bold">{profile.full_name || 'Rose Garden Customer'}</h1>
                <p className="text-sm text-white/80 mt-0.5 flex items-center gap-1.5">
                    <Phone size={13} /> +91 {profile.phone}
                </p>
            </div>

            <div className="px-4 py-4 space-y-3">
                {/* Menu items */}
                <div className="card bg-white overflow-hidden">
                    {[
                        { href: '/orders', icon: Package, label: 'My Orders', sub: 'Track and manage your orders' },
                    ].map(({ href, icon: Icon, label, sub }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-3 px-4 py-4 hover:bg-[#F5F5F5] border-b border-[#F5F5F5] last:border-0 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                                <Icon size={18} className="text-[#FF6600]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-[#2E2E2E]">{label}</p>
                                <p className="text-xs text-[#767676]">{sub}</p>
                            </div>
                            <ChevronRight size={16} className="text-[#767676]" />
                        </Link>
                    ))}
                </div>

                {/* Sign out */}
                <button
                    onClick={handleSignOut}
                    className="card bg-white w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 text-left transition-colors"
                >
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                        <LogOut size={18} className="text-red-500" />
                    </div>
                    <span className="text-sm font-semibold text-red-500">Sign Out</span>
                </button>
            </div>
        </div>
    )
}
