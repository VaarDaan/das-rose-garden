'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHmac } from 'crypto'

// ─── In-memory rate-limit store ───────────────────────────────────────────────
// Maps IP/identifier → { attempts, lockedUntil }
// In production consider a Redis store for multi-instance deployments.
interface RateEntry { attempts: number; lockedUntil: number | null }
const rateLimitMap = new Map<string, RateEntry>()

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

function getRateEntry(key: string): RateEntry {
    return rateLimitMap.get(key) ?? { attempts: 0, lockedUntil: null }
}

function isLocked(entry: RateEntry): boolean {
    if (!entry.lockedUntil) return false
    if (Date.now() < entry.lockedUntil) return true
    // Lock expired — reset
    rateLimitMap.delete(entry.lockedUntil.toString())
    return false
}

// ─── Session cookie helpers ────────────────────────────────────────────────────
const SESSION_COOKIE = 'drg_admin_session'
const SESSION_MAX_AGE = 60 * 60 * 8 // 8 hours

function signPayload(payload: string): string {
    const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret'
    return createHmac('sha256', secret).update(payload).digest('hex')
}

export async function createSessionToken(): Promise<string> {
    const payload = `admin:${Date.now()}`
    const sig = signPayload(payload)
    return `${payload}.${sig}`
}

export async function verifySessionToken(token: string): Promise<boolean> {
    const lastDot = token.lastIndexOf('.')
    if (lastDot === -1) return false
    const payload = token.slice(0, lastDot)
    const sig = token.slice(lastDot + 1)
    const expectedSig = signPayload(payload)
    // Constant-time comparison to prevent timing attacks
    if (sig.length !== expectedSig.length) return false
    let diff = 0
    for (let i = 0; i < sig.length; i++) {
        diff |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i)
    }
    return diff === 0
}

// ─── Main login action ─────────────────────────────────────────────────────────
export interface LoginResult {
    error?: string
    remainingAttempts?: number
    lockedUntil?: number
}

export async function adminLogin(
    _prevState: LoginResult,
    formData: FormData
): Promise<LoginResult> {
    const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? ''
    const password = (formData.get('password') as string | null) ?? ''

    // Basic presence check
    if (!email || !password) {
        return { error: 'Email and password are required.' }
    }

    // Rate-limit key: email (keeps per-account lockout even if IP changes)
    const key = `login:${email}`
    const entry = getRateEntry(key)

    if (isLocked(entry)) {
        const remaining = Math.ceil(((entry.lockedUntil ?? 0) - Date.now()) / 1000 / 60)
        return {
            error: `Too many failed attempts. Please try again in ${remaining} minute(s).`,
            lockedUntil: entry.lockedUntil ?? undefined,
        }
    }

    // ─── Credential verification ───────────────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL ?? ''
    const adminHash = process.env.ADMIN_PASSWORD_HASH ?? ''

    // Validate email first (constant-time ish via bcrypt always running)
    const emailMatch = email === adminEmail.toLowerCase()

    // Always run bcrypt to prevent timing-based email enumeration
    const passwordMatch = adminHash
        ? await bcrypt.compare(password, adminHash)
        : false

    if (!emailMatch || !passwordMatch) {
        // Increment attempt counter
        const newAttempts = entry.attempts + 1
        const lockedUntil = newAttempts >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_MS : null
        rateLimitMap.set(key, { attempts: newAttempts, lockedUntil })

        const remaining = MAX_ATTEMPTS - newAttempts
        if (lockedUntil) {
            return {
                error: 'Too many failed attempts. Your account is locked for 15 minutes.',
                lockedUntil,
            }
        }
        return {
            error: 'Invalid email or password.',
            remainingAttempts: remaining,
        }
    }

    // ─── Success: clear rate-limit, set session cookie ─────────────────────────
    rateLimitMap.delete(key)
    const token = await createSessionToken()

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
        httpOnly: true,      // Not accessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        sameSite: 'lax',     // CSRF protection
        maxAge: SESSION_MAX_AGE,
        path: '/admin',
    })

    redirect('/admin')
}

// ─── Logout action ─────────────────────────────────────────────────────────────
export async function adminLogout(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE)
    redirect('/admin/login')
}

// ─── Session checker (for layout/middleware use) ────────────────────────────────
export async function getAdminSession(): Promise<boolean> {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return false
    return await verifySessionToken(token)
}
