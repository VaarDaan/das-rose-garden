'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import './success.css'

function SuccessContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order')
    const trackingId = searchParams.get('tracking')
    const courier = searchParams.get('courier')
    const [showButtons, setShowButtons] = useState(false)

    useEffect(() => {
        // Show the navigation buttons after the animation completes (~2.2s)
        const timer = setTimeout(() => setShowButtons(true), 2400)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="success-screen">
            <div className="checkout-wrapper">

                {/* 3D Coin Animation */}
                <div className="coin-scene">
                    <div className="coin">
                        <div className="coin-face front">
                            <div className="coin-texture"></div>
                            <div className="coin-engraving">★</div>
                        </div>

                        <div className="coin-face edge edge-1"></div>
                        <div className="coin-face edge edge-2"></div>
                        <div className="coin-face edge edge-3"></div>
                        <div className="coin-face edge edge-4"></div>
                        <div className="coin-face edge edge-5"></div>
                        <div className="coin-face edge edge-6"></div>

                        <div className="coin-face back">
                            <div className="coin-texture"></div>
                            <div className="coin-engraving">★</div>
                        </div>
                    </div>

                    <div className="tick-container">
                        <svg className="tick-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 12L9 17L20 6" stroke="#138808" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>

                {/* Text */}
                <div className="text-box">
                    <h1 className="main-text">Order Placed Successfully</h1>
                    <p className="sub-text">Your Collection will be better from Today</p>
                </div>

                {/* Order ID badge */}
                {orderId && (
                    <div className="order-badge">
                        <span>Order #{orderId.slice(0, 8).toUpperCase()}</span>
                    </div>
                )}

                {/* Tracking info */}
                {trackingId && courier && (
                    <div className="tracking-badge">
                        <p className="tracking-label">Shipping Info</p>
                        <p className="tracking-id">Tracking: {trackingId}</p>
                        <p className="tracking-courier">Courier: {courier}</p>
                    </div>
                )}

                {/* Navigation buttons — appear after animation */}
                {showButtons && (
                    <div className="action-buttons">
                        {orderId && (
                            <Link href={`/orders/${orderId}`} className="btn-track">
                                Track Order
                            </Link>
                        )}
                        <Link href="/" className="btn-shop">
                            Continue Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="success-screen"><div className="checkout-wrapper" /></div>}>
            <SuccessContent />
        </Suspense>
    )
}
