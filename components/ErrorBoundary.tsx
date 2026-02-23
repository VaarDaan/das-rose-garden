'use client'

import React from 'react'
import { Flower2 } from 'lucide-react'

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[Rose Garden] Client-side error caught by ErrorBoundary:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
                    <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-5">
                        <Flower2 size={40} className="text-[#FF6600] opacity-60" />
                    </div>
                    <h2 className="text-xl font-bold text-[#2E2E2E] mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-sm text-[#767676] mb-6 max-w-md">
                        We hit a snag loading this page. Please try refreshing, or contact us if the issue persists.
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl p-4 max-w-lg overflow-auto mb-4 text-left">
                            {this.state.error.message}
                        </pre>
                    )}
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null })
                            window.location.reload()
                        }}
                        className="px-6 py-2.5 bg-[#FF6600] text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                    >
                        Refresh Page
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}
