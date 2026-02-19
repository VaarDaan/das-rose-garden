'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flower2, Phone, MessageCircle, User, ArrowRight, CheckCircle } from 'lucide-react'
import { generateToken, generateWhatsAppLink } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

type Step = 'phone' | 'verify' | 'name'

export default function LoginPage() {
    const [step, setStep] = useState<Step>('phone')
    const [phone, setPhone] = useState('')
    const [token, setToken] = useState('')
    const [inputToken, setInputToken] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const handlePhoneSubmit = async () => {
        const cleaned = phone.replace(/\D/g, '')
        if (cleaned.length < 10) {
            setError('Please enter a valid 10-digit mobile number')
            return
        }
        setError('')
        const newToken = generateToken()
        setToken(newToken)
        setStep('verify')
    }

    const handleWhatsApp = () => {
        const link = generateWhatsAppLink(phone, token)
        window.open(link, '_blank')
    }

    // Simulate admin confirming token → in real flow admin marks user verified in Supabase
    // For demo: if user types back the same token, we sign them in anonymously
    const handleVerifyToken = async () => {
        if (inputToken.toUpperCase() !== token) {
            setError('Invalid code. Please check and try again.')
            return
        }
        setLoading(true)
        setError('')

        const { data, error: signInError } = await supabase.auth.signInAnonymously()
        if (signInError || !data.user) {
            setError('Authentication failed. Please try again.')
            setLoading(false)
            return
        }

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', data.user.id)
            .single()

        const cleaned = phone.replace(/\D/g, '')
        if (!existingProfile?.full_name) {
            // Upsert profile with phone
            await supabase.from('profiles').upsert({
                id: data.user.id,
                phone: cleaned,
            })
            setStep('name')
        } else {
            router.push('/')
        }
        setLoading(false)
    }

    const handleNameSubmit = async () => {
        if (!fullName.trim()) { setError('Please enter your name'); return }
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id)
        }
        router.push('/')
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 flex flex-col items-center justify-center px-5">
            {/* Logo */}
            <div className="flex flex-col items-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#FF6600] to-rose-500 flex items-center justify-center mb-4 shadow-lg">
                    <Flower2 size={40} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-[#2E2E2E]">Das Rose Garden</h1>
                <p className="text-sm text-[#767676] mt-1">Premium flowers, delivered fresh</p>
            </div>

            {/* Card */}
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 border border-[#E8E8E8]">
                {step === 'phone' && (
                    <>
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-[#2E2E2E]">Sign In / Register</h2>
                            <p className="text-sm text-[#767676] mt-1">We'll verify you via WhatsApp</p>
                        </div>
                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">
                            Mobile Number
                        </label>
                        <div className="flex gap-2 mb-4">
                            <div className="flex items-center bg-[#F5F5F5] rounded-lg px-3 text-sm font-medium text-[#767676] border border-[#E8E8E8]">
                                +91
                            </div>
                            <div className="flex-1 flex items-center bg-[#F5F5F5] rounded-lg px-3 border border-[#E8E8E8] focus-within:border-[#FF6600] focus-within:bg-white transition-all">
                                <Phone size={15} className="text-[#767676] mr-2 shrink-0" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="98765 43210"
                                    maxLength={10}
                                    className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                        <button onClick={handlePhoneSubmit} className="btn-primary w-full flex items-center justify-center gap-2">
                            Continue <ArrowRight size={16} />
                        </button>
                    </>
                )}

                {step === 'verify' && (
                    <>
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageCircle size={20} className="text-[#25D366]" />
                                <h2 className="text-lg font-bold text-[#2E2E2E]">Verify via WhatsApp</h2>
                            </div>
                            <p className="text-sm text-[#767676]">
                                Click the button to send a verification message from your WhatsApp, then enter the code below.
                            </p>
                        </div>

                        <button
                            onClick={handleWhatsApp}
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-lg px-4 py-3 font-semibold flex items-center justify-center gap-2.5 mb-4 transition-colors"
                        >
                            <MessageCircle size={20} />
                            Open WhatsApp to Verify
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E8E8E8]" /></div>
                            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-[#767676]">then enter code</span></div>
                        </div>

                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">Verification Code</label>
                        <input
                            type="text"
                            value={inputToken}
                            onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                            placeholder="e.g. AB3K7X"
                            maxLength={6}
                            className="input-field mb-4 tracking-widest text-center text-lg font-bold"
                        />
                        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                        <button
                            onClick={handleVerifyToken}
                            disabled={loading || inputToken.length < 6}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {loading ? 'Verifying…' : 'Confirm Code'}
                        </button>
                    </>
                )}

                {step === 'name' && (
                    <>
                        <div className="mb-5">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle size={20} className="text-green-500" />
                                <h2 className="text-lg font-bold text-[#2E2E2E]">Welcome!</h2>
                            </div>
                            <p className="text-sm text-[#767676]">Last step — please enter your name</p>
                        </div>
                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">Full Name</label>
                        <div className="flex items-center bg-[#F5F5F5] rounded-lg px-3 border border-[#E8E8E8] focus-within:border-[#FF6600] focus-within:bg-white transition-all mb-4">
                            <User size={15} className="text-[#767676] mr-2 shrink-0" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Your full name"
                                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                            />
                        </div>
                        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                        <button
                            onClick={handleNameSubmit}
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Saving…' : 'Start Shopping 🌹'}
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
