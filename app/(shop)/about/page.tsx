import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
    title: 'About Us | Das Rose Garden',
    description: 'Our story — cultivating beauty and delivering premium flowers since 1995.',
}

export const revalidate = 60

interface TeamMember {
    name: string
    role: string
    initials: string
}

interface AboutData {
    story_title: string
    story_text: string
    mission_text: string
    team: TeamMember[]
}

const GRADIENTS = [
    'from-rose-300 to-pink-200',
    'from-green-300 to-emerald-200',
    'from-amber-300 to-yellow-200',
    'from-violet-300 to-purple-200',
]

const DEFAULT: AboutData = {
    story_title: 'Cultivating Beauty Since 1995',
    story_text: 'Our passion for roses and reputation has been cultivated since 1995. The founders of Das Rose Garden envisioned a garden where beauty meets sustainability. Over the years, our growth has enveloped us with remarkable new varieties of roses and plants.',
    mission_text: 'We provide high-quality, sustainable roses while supporting local growers and maintaining the highest quality standards for our customers.',
    team: [
        { name: 'Elara Vance', role: 'Founder', initials: 'EV' },
        { name: 'Liam Chen', role: 'Head Gardener', initials: 'LC' },
        { name: 'Jamor Raren', role: 'Gardener', initials: 'JR' },
    ],
}

export default async function AboutPage() {
    const supabase = await createClient()
    const { data: row } = await supabase.from('site_content').select('data').eq('id', 'about_us').single()
    const aboutData: AboutData = (row?.data as AboutData) || DEFAULT

    return (
        <div className="min-h-screen bg-[#FDECEF]">
            <div className="px-4 pt-6 pb-2">
                <h1 className="text-3xl font-bold text-[#2C331F]">Our Story</h1>
            </div>

            <div className="px-4 py-4 space-y-5">
                {/* Hero */}
                <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-rose-300 via-pink-200 to-green-300 flex flex-col items-center justify-center text-center">
                    <span className="text-7xl mb-3 drop-shadow-md">🌹</span>
                    <p className="text-white text-lg font-bold drop-shadow-sm">Das Rose Garden</p>
                    <p className="text-white/80 text-sm mt-1">Growing beauty since 1995</p>
                </div>

                {/* Story card */}
                <div className="bg-[#F9F6EE] rounded-2xl p-5 shadow-sm">
                    <h2 className="text-2xl font-bold text-[#2C331F] mb-3">{aboutData.story_title}</h2>
                    <p className="text-sm text-[#595959] leading-relaxed">{aboutData.story_text}</p>
                </div>

                {/* Mission */}
                <div className="bg-[#F9F6EE] rounded-2xl p-5 shadow-sm flex gap-4 items-start">
                    <div className="w-14 h-14 shrink-0 rounded-full bg-[#6B7A41]/10 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                            <path d="M24 42s-14-8-14-18c0-6 4-10 8-10 2.5 0 4.5 1 6 3 1.5-2 3.5-3 6-3 4 0 8 4 8 10 0 10-14 18-14 18z" stroke="#6B7A41" strokeWidth="2.5" fill="none" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#2C331F] mb-2">Our Mission</h3>
                        <p className="text-sm text-[#595959] leading-relaxed">{aboutData.mission_text}</p>
                    </div>
                </div>

                {/* Team */}
                {aboutData.team.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-bold text-[#2C331F] mb-5">Meet the Team</h3>
                        <div className="flex justify-around">
                            {aboutData.team.map((person, i) => (
                                <div key={person.name} className="flex flex-col items-center text-center">
                                    <div className={`w-24 h-24 rounded-full overflow-hidden mb-2 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center border-3 border-white shadow-md`}>
                                        <span className="text-2xl font-bold text-white drop-shadow-sm">{person.initials}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-[#2C331F]" style={{ fontFamily: 'Inter, sans-serif' }}>{person.name}</p>
                                    <p className="text-xs text-[#595959]">{person.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Link href="/categories" className="block w-full bg-[#6B7A41] text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-[#5A6836] transition-colors text-center">
                    Explore Our Roses
                </Link>
            </div>
        </div>
    )
}
