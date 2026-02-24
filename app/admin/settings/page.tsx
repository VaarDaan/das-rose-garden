'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Settings as SettingsIcon, Phone, Mail, Clock, MessageCircle, MapPin, Store } from 'lucide-react'

interface SiteSettings {
    site_name: string
    phone: string
    email: string
    hours: string
    whatsapp: string
    address: string
}

const DEFAULT_SETTINGS: SiteSettings = {
    site_name: 'Das Rose Garden',
    phone: '+918250928721',
    email: 'dasshuvankar470@gmail.com',
    hours: 'Mon-Sat: 9 AM - 8 PM',
    whatsapp: '918250928721',
    address: '',
}

export default function SiteSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetch = async () => {
            const { data } = await supabase.from('site_content').select('data').eq('id', 'site_settings').single()
            if (data?.data) setSettings(data.data as SiteSettings)
            setLoading(false)
        }
        fetch()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        const { error } = await supabase.from('site_content').upsert({
            id: 'site_settings',
            data: settings,
            updated_at: new Date().toISOString(),
        })
        setSaving(false)
        if (error) { alert('Error: ' + error.message); return }
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const update = (key: keyof SiteSettings, value: string) => {
        setSettings({ ...settings, [key]: value })
    }

    if (loading) return <div className="p-6"><div className="h-60 bg-[#F9F6EE] rounded-2xl animate-pulse" /></div>

    const fields: { key: keyof SiteSettings; label: string; icon: any; placeholder: string }[] = [
        { key: 'site_name', label: 'Site Name', icon: Store, placeholder: 'Das Rose Garden' },
        { key: 'phone', label: 'Phone Number', icon: Phone, placeholder: '+91 XXXXX XXXXX' },
        { key: 'email', label: 'Email Address', icon: Mail, placeholder: 'email@example.com' },
        { key: 'hours', label: 'Business Hours', icon: Clock, placeholder: 'Mon-Sat: 9 AM - 8 PM' },
        { key: 'whatsapp', label: 'WhatsApp Number', icon: MessageCircle, placeholder: '91XXXXXXXXXX (no +)' },
        { key: 'address', label: 'Business Address', icon: MapPin, placeholder: 'Your store address' },
    ]

    return (
        <div className="p-6 max-w-3xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#2C331F]">Site Settings</h1>
                    <p className="text-sm text-[#595959]" style={{ fontFamily: 'Inter, sans-serif' }}>Manage your store&apos;s contact information</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
                    <Save size={16} /> {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-[#F9F6EE] rounded-2xl p-5 border border-[#E8E4D9]/60 space-y-4">
                {fields.map(({ key, label, icon: Icon, placeholder }) => (
                    <div key={key}>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#2C331F] mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <Icon size={14} className="text-[#6B7A41]" />
                            {label}
                        </label>
                        <input
                            value={settings[key]}
                            onChange={e => update(key, e.target.value)}
                            placeholder={placeholder}
                            className="input-field"
                        />
                    </div>
                ))}
            </div>

            <div className="mt-4 bg-[#F9F6EE] rounded-2xl p-4 border border-[#E8E4D9]/60 text-center">
                <p className="text-xs text-[#595959]">
                    💡 These settings are used across the store in the Contact page, Footer, and WhatsApp links.
                </p>
            </div>
        </div>
    )
}
