'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Plus, Trash2, FileText } from 'lucide-react'

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

const DEFAULT_DATA: AboutData = {
    story_title: 'Cultivating Beauty Since 1995',
    story_text: '',
    mission_text: '',
    team: [],
}

export default function AboutEditorPage() {
    const [data, setData] = useState<AboutData>(DEFAULT_DATA)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetch = async () => {
            const { data: row } = await supabase.from('site_content').select('data').eq('id', 'about_us').single()
            if (row?.data) setData(row.data as AboutData)
            setLoading(false)
        }
        fetch()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        const { error } = await supabase.from('site_content').upsert({
            id: 'about_us',
            data,
            updated_at: new Date().toISOString(),
        })
        setSaving(false)
        if (error) { alert('Error: ' + error.message); return }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const updateTeamMember = (idx: number, field: keyof TeamMember, value: string) => {
        const updated = [...data.team]
        updated[idx] = { ...updated[idx], [field]: value }
        if (field === 'name') {
            updated[idx].initials = value.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        }
        setData({ ...data, team: updated })
    }

    const addTeamMember = () => {
        setData({ ...data, team: [...data.team, { name: '', role: '', initials: '' }] })
    }

    const removeTeamMember = (idx: number) => {
        setData({ ...data, team: data.team.filter((_, i) => i !== idx) })
    }

    if (loading) return <div className="p-6"><div className="h-60 bg-[#F9F6EE] rounded-2xl animate-pulse" /></div>

    return (
        <div className="p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#2C331F]">About Us Editor</h1>
                    <p className="text-sm text-[#595959]" style={{ fontFamily: 'Inter, sans-serif' }}>Edit the About Us page content</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    <Save size={16} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-5">
                {/* Story Section */}
                <div className="bg-[#F9F6EE] rounded-2xl p-5 border border-[#E8E4D9]/60">
                    <h2 className="font-bold text-[#2C331F] mb-3 text-sm flex items-center gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <FileText size={14} /> Our Story Section
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-[#595959] mb-1">Story Title</label>
                            <input value={data.story_title} onChange={e => setData({ ...data, story_title: e.target.value })} className="input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-[#595959] mb-1">Story Text</label>
                            <textarea value={data.story_text} onChange={e => setData({ ...data, story_text: e.target.value })} rows={4} className="input-field resize-none" />
                        </div>
                    </div>
                </div>

                {/* Mission Section */}
                <div className="bg-[#F9F6EE] rounded-2xl p-5 border border-[#E8E4D9]/60">
                    <h2 className="font-bold text-[#2C331F] mb-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Our Mission</h2>
                    <textarea value={data.mission_text} onChange={e => setData({ ...data, mission_text: e.target.value })} rows={3} className="input-field resize-none" placeholder="Mission statement..." />
                </div>

                {/* Team Members */}
                <div className="bg-[#F9F6EE] rounded-2xl p-5 border border-[#E8E4D9]/60">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-[#2C331F] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Team Members</h2>
                        <button onClick={addTeamMember} className="text-xs text-[#6B7A41] font-semibold flex items-center gap-1 hover:underline">
                            <Plus size={12} /> Add Member
                        </button>
                    </div>
                    <div className="space-y-3">
                        {data.team.map((member, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-300 to-green-200 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                    {member.initials || '?'}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <input value={member.name} onChange={e => updateTeamMember(idx, 'name', e.target.value)} placeholder="Name" className="input-field text-sm" />
                                    <input value={member.role} onChange={e => updateTeamMember(idx, 'role', e.target.value)} placeholder="Role" className="input-field text-sm" />
                                </div>
                                <button onClick={() => removeTeamMember(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-[#595959] hover:text-red-500 mt-1">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {data.team.length === 0 && (
                            <p className="text-xs text-[#595959] text-center py-4">No team members added yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
