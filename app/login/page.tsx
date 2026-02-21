'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Flower2,
    Mail,
    Lock,
    Phone,
    User,
    ArrowRight,
    CheckCircle,
    Eye,
    EyeOff,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Screen = 'choice' | 'login' | 'signup' | 'done'

// Google "G" logo SVG
function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    )
}

function PasswordInput({
    value,
    onChange,
    placeholder,
}: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
}) {
    const [show, setShow] = useState(false)
    return (
        <div className="flex items-center bg-[#F5F5F5] rounded-lg px-3 border border-[#E8E8E8] focus-within:border-[#FF6600] focus-within:bg-white transition-all">
            <Lock size={15} className="text-[#767676] mr-2 shrink-0" />
            <input
                type={show ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder ?? 'Password'}
                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            />
            <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="ml-1 text-[#767676] hover:text-[#FF6600]"
                tabIndex={-1}
            >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
        </div>
    )
}

export default function LoginPage() {
    const [screen, setScreen] = useState<Screen>('choice')
    const [googleLoading, setGoogleLoading] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Login fields
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    // Sign-up fields
    const [signupEmail, setSignupEmail] = useState('')
    const [signupPhone, setSignupPhone] = useState('')
    const [signupPassword, setSignupPassword] = useState('')
    const [signupConfirm, setSignupConfirm] = useState('')

    const router = useRouter()
    const supabase = createClient()

    const resetError = () => setError('')

    // ── Google Sign-In ──────────────────────────────────────────────────────
    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
            },
        })
        if (error) {
            setError('Google sign-in failed. Please try again.')
            setGoogleLoading(false)
        }
    }

    // ── Email / Password Login ──────────────────────────────────────────────
    const handleEmailLogin = async () => {
        if (!loginEmail.trim() || !loginPassword) {
            setError('Please enter your email and password.')
            return
        }
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({
            email: loginEmail.trim(),
            password: loginPassword,
        })
        if (error) {
            setError(error.message)
        } else {
            router.push('/')
        }
        setLoading(false)
    }

    // ── Sign Up ─────────────────────────────────────────────────────────────
    const handleSignUp = async () => {
        if (!signupEmail.trim() || !signupPassword || !signupConfirm) {
            setError('Please fill in all required fields.')
            return
        }
        if (signupPassword !== signupConfirm) {
            setError('Passwords do not match.')
            return
        }
        if (signupPassword.length < 6) {
            setError('Password must be at least 6 characters.')
            return
        }
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signUp({
            email: signupEmail.trim(),
            password: signupPassword,
            options: {
                data: {
                    phone: signupPhone.replace(/\D/g, '') || undefined,
                },
            },
        })
        if (error) {
            setError(error.message)
        } else {
            setScreen('done')
        }
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

                {/* ── CHOICE ── */}
                {screen === 'choice' && (
                    <>
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-bold text-[#2E2E2E]">Welcome</h2>
                            <p className="text-sm text-[#767676] mt-1">What would you like to do?</p>
                        </div>

                        <button
                            onClick={() => { resetError(); setScreen('login') }}
                            className="w-full flex items-center justify-between bg-gradient-to-r from-[#FF6600] to-rose-500 text-white rounded-xl px-5 py-4 font-semibold text-base shadow-md hover:opacity-90 transition-opacity mb-3"
                        >
                            <span>Log In</span>
                            <ArrowRight size={18} />
                        </button>

                        <button
                            onClick={() => { resetError(); setScreen('signup') }}
                            className="w-full flex items-center justify-between border-2 border-[#FF6600] text-[#FF6600] rounded-xl px-5 py-4 font-semibold text-base hover:bg-orange-50 transition-colors"
                        >
                            <span>Sign Up</span>
                            <ArrowRight size={18} />
                        </button>
                    </>
                )}

                {/* ── LOG IN ── */}
                {screen === 'login' && (
                    <>
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-[#2E2E2E]">Log In</h2>
                            <p className="text-sm text-[#767676] mt-1">Welcome back!</p>
                        </div>

                        {/* Google */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={googleLoading}
                            className="w-full flex items-center justify-center gap-3 border border-[#E8E8E8] rounded-lg px-4 py-3 font-semibold text-[#2E2E2E] hover:bg-[#F5F5F5] transition-colors mb-4 disabled:opacity-60"
                        >
                            <GoogleIcon />
                            {googleLoading ? 'Redirecting…' : 'Continue with Google'}
                        </button>

                        {/* Divider */}
                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#E8E8E8]" /></div>
                            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-[#767676]">or sign in with email</span></div>
                        </div>

                        {/* Email */}
                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">Email</label>
                        <div className="flex items-center bg-[#F5F5F5] rounded-lg px-3 border border-[#E8E8E8] focus-within:border-[#FF6600] focus-within:bg-white transition-all mb-3">
                            <Mail size={15} className="text-[#767676] mr-2 shrink-0" />
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                            />
                        </div>

                        {/* Password */}
                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">Password</label>
                        <div className="mb-4">
                            <PasswordInput value={loginPassword} onChange={setLoginPassword} placeholder="Your password" />
                        </div>

                        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

                        <button
                            onClick={handleEmailLogin}
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? 'Logging in…' : 'Log In'}
                        </button>

                        <p className="text-center text-xs text-[#767676] mt-4">
                            Don&apos;t have an account?{' '}
                            <button onClick={() => { resetError(); setScreen('signup') }} className="text-[#FF6600] font-semibold hover:underline">
                                Sign Up
                            </button>
                        </p>
                        <button onClick={() => { resetError(); setScreen('choice') }} className="w-full text-center text-xs text-[#767676] mt-2 hover:text-[#FF6600]">
                            ← Back
                        </button>
                    </>
                )}

                {/* ── SIGN UP ── */}
                {screen === 'signup' && (
                    <>
                        <div className="mb-5">
                            <h2 className="text-lg font-bold text-[#2E2E2E]">Create Account</h2>
                            <p className="text-sm text-[#767676] mt-1">Join Das Rose Garden</p>
                        </div>

                        {/* Email */}
                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">Email <span className="text-[#FF6600]">*</span></label>
                        <div className="flex items-center bg-[#F5F5F5] rounded-lg px-3 border border-[#E8E8E8] focus-within:border-[#FF6600] focus-within:bg-white transition-all mb-3">
                            <Mail size={15} className="text-[#767676] mr-2 shrink-0" />
                            <input
                                type="email"
                                value={signupEmail}
                                onChange={(e) => setSignupEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                            />
                        </div>

                        {/* Phone (optional) */}
                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">Phone Number <span className="text-[#767676] font-normal">(optional)</span></label>
                        <div className="flex gap-2 mb-3">
                            <div className="flex items-center bg-[#F5F5F5] rounded-lg px-3 text-sm font-medium text-[#767676] border border-[#E8E8E8]">+91</div>
                            <div className="flex-1 flex items-center bg-[#F5F5F5] rounded-lg px-3 border border-[#E8E8E8] focus-within:border-[#FF6600] focus-within:bg-white transition-all">
                                <Phone size={15} className="text-[#767676] mr-2 shrink-0" />
                                <input
                                    type="tel"
                                    value={signupPhone}
                                    onChange={(e) => setSignupPhone(e.target.value)}
                                    placeholder="98765 43210"
                                    maxLength={10}
                                    className="flex-1 bg-transparent py-2.5 text-sm outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">Password <span className="text-[#FF6600]">*</span></label>
                        <div className="mb-3">
                            <PasswordInput value={signupPassword} onChange={setSignupPassword} placeholder="At least 6 characters" />
                        </div>

                        {/* Confirm Password */}
                        <label className="block text-xs font-semibold text-[#2E2E2E] mb-1.5">Confirm Password <span className="text-[#FF6600]">*</span></label>
                        <div className="mb-4">
                            <PasswordInput value={signupConfirm} onChange={setSignupConfirm} placeholder="Repeat your password" />
                        </div>

                        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

                        <button
                            onClick={handleSignUp}
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading ? 'Creating account…' : 'Create Account'}
                        </button>

                        <p className="text-center text-xs text-[#767676] mt-4">
                            Already have an account?{' '}
                            <button onClick={() => { resetError(); setScreen('login') }} className="text-[#FF6600] font-semibold hover:underline">
                                Log In
                            </button>
                        </p>
                        <button onClick={() => { resetError(); setScreen('choice') }} className="w-full text-center text-xs text-[#767676] mt-2 hover:text-[#FF6600]">
                            ← Back
                        </button>
                    </>
                )}

                {/* ── DONE (email confirmation) ── */}
                {screen === 'done' && (
                    <div className="text-center py-4">
                        <div className="flex justify-center mb-4">
                            <CheckCircle size={52} className="text-green-500" />
                        </div>
                        <h2 className="text-lg font-bold text-[#2E2E2E] mb-2">Check your inbox!</h2>
                        <p className="text-sm text-[#767676] mb-6">
                            We&apos;ve sent a confirmation link to <span className="font-semibold text-[#2E2E2E]">{signupEmail}</span>. Click it to activate your account.
                        </p>
                        <button
                            onClick={() => { resetError(); setScreen('login') }}
                            className="btn-primary w-full"
                        >
                            Go to Log In
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
