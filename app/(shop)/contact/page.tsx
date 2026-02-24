'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Send, MessageCircle, Clock, Flower2 } from 'lucide-react'

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false)
    const [sending, setSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSending(true)
        // Simulate form submission delay
        await new Promise(r => setTimeout(r, 1500))
        setSending(false)
        setSubmitted(true)
    }

    return (
        <div className="min-h-screen bg-[#FDECEF]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#6B7A41] to-[#2C331F] px-4 py-10 text-center text-white">
                <Flower2 size={36} className="mx-auto mb-3 opacity-80" strokeWidth={1.5} />
                <h1 className="text-3xl font-bold text-white">Contact Us</h1>
                <p className="text-sm text-white/80 mt-2">We&apos;d love to hear from you</p>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Contact details */}
                <div className="bg-[#F9F6EE] rounded-2xl p-5 border border-[#E8E4D9]/60 space-y-4">
                    <a href="tel:+918250928721" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-[#6B7A41]/10 flex items-center justify-center shrink-0">
                            <Phone size={18} className="text-[#6B7A41]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#595959] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Phone</p>
                            <p className="text-sm font-medium text-[#2C331F]">+91 82509 28721</p>
                        </div>
                    </a>

                    <a href="mailto:dasshuvankar470@gmail.com" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-xl bg-[#6B7A41]/10 flex items-center justify-center shrink-0">
                            <Mail size={18} className="text-[#6B7A41]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#595959] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Email</p>
                            <p className="text-sm font-medium text-[#2C331F]">dasshuvankar470@gmail.com</p>
                        </div>
                    </a>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#6B7A41]/10 flex items-center justify-center shrink-0">
                            <Clock size={18} className="text-[#6B7A41]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#595959] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Hours</p>
                            <p className="text-sm font-medium text-[#2C331F]">Mon–Sat: 9 AM – 8 PM</p>
                        </div>
                    </div>
                </div>

                {/* WhatsApp Quick Link */}
                <a href="https://wa.me/918250928721" target="_blank" rel="noopener noreferrer"
                    className="bg-green-50 rounded-2xl p-4 flex items-center gap-3 border border-green-200 hover:bg-green-100/80 transition-colors">
                    <MessageCircle size={20} className="text-green-600" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-green-800">Chat on WhatsApp</p>
                        <p className="text-xs text-green-600">Fastest way to reach us</p>
                    </div>
                </a>

                {/* Contact Form */}
                <div className="bg-[#F9F6EE] rounded-2xl p-5 border border-[#E8E4D9]/60">
                    <h2 className="text-lg font-bold text-[#2C331F] mb-4">Send us a Message</h2>

                    {submitted ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                                <Send size={28} className="text-green-500" />
                            </div>
                            <h3 className="text-base font-bold text-[#2C331F] mb-1">Message Sent! 🌹</h3>
                            <p className="text-sm text-[#595959]">We&apos;ll get back to you as soon as possible</p>
                            <button onClick={() => setSubmitted(false)} className="btn-secondary mt-4 text-sm">
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <input placeholder="Your Name" required className="input-field" />
                            </div>
                            <div>
                                <input placeholder="Email Address" type="email" required className="input-field" />
                            </div>
                            <div>
                                <input placeholder="Subject" required className="input-field" />
                            </div>
                            <div>
                                <textarea placeholder="Your Message" required rows={4} className="input-field resize-none" />
                            </div>
                            <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                                {sending ? 'Sending…' : (
                                    <>
                                        <Send size={16} /> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
