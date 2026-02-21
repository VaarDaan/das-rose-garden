'use client'

import { useActionState, useState, useEffect } from 'react'
import { adminLogin, type LoginResult } from './actions'
import { Eye, EyeOff, Shield, Lock, Mail, AlertTriangle, Loader2 } from 'lucide-react'

const initialState: LoginResult = {}

export default function AdminLoginPage() {
    const [state, formAction, isPending] = useActionState(adminLogin, initialState)
    const [showPassword, setShowPassword] = useState(false)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    // Countdown timer for lockout
    useEffect(() => {
        if (!state.lockedUntil) { setCountdown(null); return }
        const tick = () => {
            const remaining = Math.max(0, Math.ceil((state.lockedUntil! - Date.now()) / 1000))
            setCountdown(remaining)
            if (remaining <= 0) clearInterval(interval)
        }
        tick()
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [state.lockedUntil])

    const formatCountdown = (sec: number) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="admin-login-root">
            {/* Animated background */}
            <div className="admin-bg">
                <div className="admin-orb admin-orb-1" />
                <div className="admin-orb admin-orb-2" />
                <div className="admin-orb admin-orb-3" />
                <div className="admin-grid-overlay" />
            </div>

            {/* Login card */}
            <div className={`admin-card ${mounted ? 'admin-card--visible' : ''}`}>
                {/* Header */}
                <div className="admin-card-header">
                    <div className="admin-shield-icon">
                        <Shield size={28} className="admin-shield-svg" />
                    </div>
                    <h1 className="admin-title">Admin Portal</h1>
                    <p className="admin-subtitle">Authorized personnel only</p>
                    <div className="admin-secure-badge">
                        <Lock size={11} />
                        <span>Secured & Encrypted</span>
                    </div>
                </div>

                {/* Error banner */}
                {state.error && (
                    <div className="admin-error-banner">
                        <AlertTriangle size={16} className="shrink-0" />
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Attempt warning */}
                {state.remainingAttempts !== undefined && state.remainingAttempts > 0 && !state.lockedUntil && (
                    <div className="admin-warn-banner">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>{state.remainingAttempts} attempt{state.remainingAttempts !== 1 ? 's' : ''} remaining before lockout</span>
                    </div>
                )}

                {/* Countdown */}
                {countdown !== null && countdown > 0 && (
                    <div className="admin-countdown">
                        <div className="admin-countdown-ring">
                            <span className="admin-countdown-time">{formatCountdown(countdown)}</span>
                        </div>
                        <p className="admin-countdown-label">Account locked. Try again in</p>
                    </div>
                )}

                {/* Form */}
                <form action={formAction} className="admin-form" autoComplete="off">
                    {/* Email field */}
                    <div className="admin-field">
                        <label htmlFor="admin-email" className="admin-label">
                            Email Address
                        </label>
                        <div className="admin-input-wrap">
                            <Mail size={16} className="admin-input-icon" />
                            <input
                                id="admin-email"
                                name="email"
                                type="email"
                                required
                                autoComplete="username"
                                placeholder="admin@example.com"
                                className="admin-input"
                                disabled={isPending || (countdown !== null && countdown > 0)}
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div className="admin-field">
                        <label htmlFor="admin-password" className="admin-label">
                            Password
                        </label>
                        <div className="admin-input-wrap">
                            <Lock size={16} className="admin-input-icon" />
                            <input
                                id="admin-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="current-password"
                                placeholder="••••••••••"
                                className="admin-input admin-input--pw"
                                disabled={isPending || (countdown !== null && countdown > 0)}
                            />
                            <button
                                type="button"
                                className="admin-eye-btn"
                                onClick={() => setShowPassword(p => !p)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="admin-submit-btn"
                        disabled={isPending || (countdown !== null && countdown > 0)}
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={18} className="admin-spin" />
                                Authenticating…
                            </>
                        ) : (
                            <>
                                <Shield size={18} />
                                Sign In to Admin Panel
                            </>
                        )}
                    </button>
                </form>

                {/* Footer note */}
                <p className="admin-footer-note">
                    This portal is monitored. Unauthorized access attempts are logged.
                </p>
            </div>

            <style>{`
                /* ── Root & Background ── */
                .admin-login-root {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    background: #0a0a0f;
                    overflow: hidden;
                    position: relative;
                    font-family: 'Inter', system-ui, sans-serif;
                }

                .admin-bg {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                }

                .admin-orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.35;
                    animation: orb-drift 12s ease-in-out infinite alternate;
                }

                .admin-orb-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, #FF6600 0%, transparent 70%);
                    top: -200px; left: -150px;
                    animation-duration: 14s;
                }

                .admin-orb-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
                    bottom: -150px; right: -100px;
                    animation-duration: 18s;
                    animation-delay: -6s;
                }

                .admin-orb-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, #0ea5e9 0%, transparent 70%);
                    top: 50%; left: 60%;
                    opacity: 0.15;
                    animation-duration: 22s;
                    animation-delay: -3s;
                }

                .admin-grid-overlay {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 48px 48px;
                }

                @keyframes orb-drift {
                    0%   { transform: translate(0, 0) scale(1); }
                    50%  { transform: translate(40px, -30px) scale(1.08); }
                    100% { transform: translate(-20px, 50px) scale(0.95); }
                }

                /* ── Card ── */
                .admin-card {
                    position: relative;
                    z-index: 10;
                    width: 100%;
                    max-width: 440px;
                    background: rgba(15, 15, 25, 0.85);
                    border: 1px solid rgba(255, 102, 0, 0.2);
                    border-radius: 1.5rem;
                    padding: 2.5rem 2rem;
                    backdrop-filter: blur(20px);
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,0.05),
                        0 20px 60px rgba(0,0,0,0.6),
                        0 0 80px rgba(255, 102, 0, 0.08);
                    opacity: 0;
                    transform: translateY(24px);
                    transition: opacity 0.5s ease, transform 0.5s ease;
                }

                .admin-card--visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                /* ── Card Header ── */
                .admin-card-header {
                    text-align: center;
                    margin-bottom: 1.75rem;
                }

                .admin-shield-icon {
                    width: 68px; height: 68px;
                    margin: 0 auto 1rem;
                    border-radius: 1.25rem;
                    background: linear-gradient(135deg, #FF6600 0%, #c84b00 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow:
                        0 8px 24px rgba(255,102,0,0.4),
                        0 0 0 1px rgba(255,102,0,0.3);
                    animation: icon-pulse 3s ease-in-out infinite;
                }

                @keyframes icon-pulse {
                    0%, 100% { box-shadow: 0 8px 24px rgba(255,102,0,0.4), 0 0 0 1px rgba(255,102,0,0.3); }
                    50%       { box-shadow: 0 8px 32px rgba(255,102,0,0.6), 0 0 0 4px rgba(255,102,0,0.1); }
                }

                .admin-shield-svg { color: white; }

                .admin-title {
                    font-size: 1.625rem;
                    font-weight: 800;
                    color: #ffffff;
                    letter-spacing: -0.03em;
                    margin: 0 0 0.25rem;
                }

                .admin-subtitle {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.45);
                    margin: 0 0 0.875rem;
                }

                .admin-secure-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.35rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 9999px;
                    background: rgba(255, 102, 0, 0.12);
                    border: 1px solid rgba(255, 102, 0, 0.25);
                    color: #FF6600;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                /* ── Error / Warn banners ── */
                .admin-error-banner {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.6rem;
                    padding: 0.8rem 1rem;
                    border-radius: 0.75rem;
                    background: rgba(220, 38, 38, 0.12);
                    border: 1px solid rgba(220, 38, 38, 0.3);
                    color: #fca5a5;
                    font-size: 0.82rem;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }

                .admin-warn-banner {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.6rem;
                    padding: 0.7rem 1rem;
                    border-radius: 0.75rem;
                    background: rgba(234, 179, 8, 0.1);
                    border: 1px solid rgba(234, 179, 8, 0.25);
                    color: #fde047;
                    font-size: 0.8rem;
                    margin-bottom: 1rem;
                }

                /* ── Lockout countdown ── */
                .admin-countdown {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1.25rem;
                }

                .admin-countdown-ring {
                    width: 80px; height: 80px;
                    border-radius: 50%;
                    border: 3px solid rgba(220, 38, 38, 0.3);
                    border-top-color: #dc2626;
                    animation: spin-ring 1s linear infinite;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                @keyframes spin-ring {
                    to { transform: rotate(360deg); }
                }

                .admin-countdown-time {
                    font-size: 1.1rem;
                    font-weight: 700;
                    font-variant-numeric: tabular-nums;
                    color: #fca5a5;
                    animation: none;
                }

                .admin-countdown-label {
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.4);
                    margin: 0;
                }

                /* ── Form ── */
                .admin-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.125rem;
                }

                .admin-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.45rem;
                }

                .admin-label {
                    font-size: 0.78rem;
                    font-weight: 600;
                    color: rgba(255,255,255,0.6);
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }

                .admin-input-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .admin-input-icon {
                    position: absolute;
                    left: 0.9rem;
                    color: rgba(255,255,255,0.35);
                    pointer-events: none;
                    z-index: 1;
                }

                .admin-input {
                    width: 100%;
                    height: 3rem;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.75rem;
                    padding: 0 1rem 0 2.75rem;
                    font-size: 0.9rem;
                    color: #ffffff;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
                    font-family: 'Inter', system-ui, sans-serif;
                }

                .admin-input::placeholder { color: rgba(255,255,255,0.2); }

                .admin-input:focus {
                    border-color: rgba(255, 102, 0, 0.6);
                    background: rgba(255,255,255,0.07);
                    box-shadow: 0 0 0 3px rgba(255, 102, 0, 0.12);
                }

                .admin-input:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .admin-input--pw { padding-right: 3rem; }

                .admin-eye-btn {
                    position: absolute;
                    right: 0.9rem;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.35);
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    transition: color 0.15s;
                    border-radius: 0.25rem;
                }

                .admin-eye-btn:hover { color: rgba(255,255,255,0.7); }

                /* ── Submit button ── */
                .admin-submit-btn {
                    margin-top: 0.5rem;
                    width: 100%;
                    height: 3.25rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.6rem;
                    background: linear-gradient(135deg, #FF6600 0%, #e55000 100%);
                    color: white;
                    font-weight: 700;
                    font-size: 0.95rem;
                    border: none;
                    border-radius: 0.875rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 20px rgba(255, 102, 0, 0.35);
                    letter-spacing: 0.01em;
                    font-family: 'Inter', system-ui, sans-serif;
                }

                .admin-submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 28px rgba(255, 102, 0, 0.5);
                    background: linear-gradient(135deg, #ff7a1a 0%, #FF6600 100%);
                }

                .admin-submit-btn:active:not(:disabled) {
                    transform: translateY(0) scale(0.98);
                }

                .admin-submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .admin-spin {
                    animation: spin 0.8s linear infinite;
                }

                /* ── Footer note ── */
                .admin-footer-note {
                    margin-top: 1.5rem;
                    text-align: center;
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.2);
                    line-height: 1.5;
                }
            `}</style>
        </div>
    )
}
