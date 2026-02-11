'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (authError) throw authError

            if (authData.user) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', authData.user.id)
                    .single()

                if (profileError) throw profileError

                const dashboardPath = profile.role === 'manager' ? '/dashboard/manager'
                    : profile.role === 'developer' ? '/dashboard/developer'
                        : '/dashboard/tester'

                router.push(dashboardPath)
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F4F5F7] px-4 relative overflow-hidden">
            {/* Bottom Left Illustration - Enhanced Realism */}
            <div className="fixed bottom-0 left-0 w-80 h-80 pointer-events-none">
                <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        {/* Gradients for realistic depth */}
                        <linearGradient id="platformGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#0052CC" stopOpacity="0.15" />
                        </linearGradient>
                        <linearGradient id="platformGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0052CC" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2684FF" stopOpacity="0.35" />
                        </linearGradient>
                        <linearGradient id="characterBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#2684FF" />
                            <stop offset="100%" stopColor="#0052CC" />
                        </linearGradient>
                        <linearGradient id="characterOrange" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FFB84D" />
                            <stop offset="100%" stopColor="#FF8B00" />
                        </linearGradient>
                        <radialGradient id="shadowGrad">
                            <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Isometric Platform - Multiple Layers */}
                    <path d="M30 260 L180 190 L330 260 L180 330 Z" fill="url(#platformGrad1)" />
                    <path d="M30 260 L180 190 L180 210 L30 280 Z" fill="url(#platformGrad2)" />
                    <path d="M180 190 L330 260 L330 280 L180 210 Z" fill="#2684FF" opacity="0.4" />

                    {/* Platform Top Surface with Grid */}
                    <path d="M30 260 L180 190 L330 260 L180 330 Z" fill="#E3F2FD" opacity="0.6" />
                    <line x1="180" y1="190" x2="180" y2="330" stroke="#0052CC" strokeWidth="0.5" opacity="0.2" />
                    <line x1="100" y1="225" x2="260" y2="295" stroke="#0052CC" strokeWidth="0.5" opacity="0.2" />

                    {/* Character 1 - Orange/Yellow (More Detailed) */}
                    <ellipse cx="110" cy="250" rx="18" ry="6" fill="url(#shadowGrad)" />
                    {/* Legs */}
                    <rect x="105" y="235" width="5" height="15" rx="2.5" fill="#FF8B00" />
                    <rect x="115" y="235" width="5" height="15" rx="2.5" fill="#FF8B00" />
                    {/* Body */}
                    <rect x="102" y="210" width="20" height="28" rx="3" fill="url(#characterOrange)" />
                    {/* Arms with gradient */}
                    <path d="M102 218 Q95 215 90 220 L88 228 Q93 225 100 225 Z" fill="#FFB84D" />
                    <path d="M122 220 Q128 228 125 235" stroke="#FF8B00" strokeWidth="4" strokeLinecap="round" />
                    {/* Head with shading */}
                    <circle cx="112" cy="205" r="9" fill="#FFD54F" />
                    <circle cx="112" cy="203" r="8" fill="#FFEB3B" />
                    {/* Face details */}
                    <circle cx="109" cy="204" r="1.5" fill="#333" />
                    <circle cx="115" cy="204" r="1.5" fill="#333" />
                    <path d="M109 207 Q112 209 115 207" stroke="#333" strokeWidth="0.8" fill="none" />
                    {/* Hair */}
                    <path d="M105 200 Q108 195 112 196 Q116 195 118 199" stroke="#FFB74D" strokeWidth="2" strokeLinecap="round" fill="none" />

                    {/* Character 2 - Blue (More Detailed) */}
                    <ellipse cx="160" cy="235" rx="18" ry="6" fill="url(#shadowGrad)" />
                    {/* Legs */}
                    <rect x="155" y="220" width="5" height="15" rx="2.5" fill="#0052CC" />
                    <rect x="165" y="220" width="5" height="15" rx="2.5" fill="#0052CC" />
                    {/* Body */}
                    <rect x="152" y="195" width="20" height="28" rx="3" fill="url(#characterBlue)" />
                    {/* Arms */}
                    <path d="M152 203 Q145 200 140 205 L138 213 Q143 210 150 210 Z" fill="#4A90E2" />
                    <path d="M172 203 L185 208" stroke="#2684FF" strokeWidth="4" strokeLinecap="round" />
                    {/* Head with shading */}
                    <circle cx="162" cy="190" r="9" fill="#5BA3F5" />
                    <circle cx="162" cy="188" r="8" fill="#64B5F6" />
                    {/* Face details */}
                    <circle cx="159" cy="189" r="1.5" fill="#fff" />
                    <circle cx="165" cy="189" r="1.5" fill="#fff" />
                    <circle cx="159.5" cy="189.5" r="0.8" fill="#333" />
                    <circle cx="165.5" cy="189.5" r="0.8" fill="#333" />
                    <path d="M159 192 Q162 194 165 192" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.8" />

                    {/* Document Stack - Detailed */}
                    <g transform="translate(185, 200)">
                        {/* Paper 1 - Back */}
                        <rect x="2" y="2" width="45" height="58" rx="2" fill="#E8EAF6" opacity="0.5" />
                        {/* Paper 2 - Middle */}
                        <rect x="0" y="0" width="45" height="58" rx="2" fill="white" stroke="#BDBDBD" strokeWidth="1" />
                        <line x1="6" y1="8" x2="39" y2="8" stroke="#0052CC" strokeWidth="2" opacity="0.3" />
                        <line x1="6" y1="15" x2="35" y2="15" stroke="#2684FF" strokeWidth="1.5" opacity="0.3" />
                        <line x1="6" y1="20" x2="39" y2="20" stroke="#0052CC" strokeWidth="2" opacity="0.3" />
                        <line x1="6" y1="27" x2="32" y2="27" stroke="#2684FF" strokeWidth="1.5" opacity="0.3" />
                        {/* Checkmarks */}
                        <circle cx="8" cy="35" r="3" fill="#4CAF50" opacity="0.2" />
                        <path d="M7 35 L8.5 36.5 L10 34" stroke="#4CAF50" strokeWidth="1.2" fill="none" />
                        <circle cx="8" cy="43" r="3" fill="#4CAF50" opacity="0.2" />
                        <path d="M7 43 L8.5 44.5 L10 42" stroke="#4CAF50" strokeWidth="1.2" fill="none" />
                        {/* Graph icon */}
                        <rect x="28" y="40" width="10" height="12" stroke="#FF9800" strokeWidth="1" fill="none" opacity="0.4" />
                        <path d="M29 48 L32 45 L35 47 L37 43" stroke="#FF9800" strokeWidth="1.2" fill="none" opacity="0.6" />
                    </g>

                    {/* Floating Elements */}
                    <circle cx="250" cy="180" r="4" fill="#FFB74D" opacity="0.3" />
                    <circle cx="280" cy="220" r="3" fill="#64B5F6" opacity="0.3" />
                    <rect x="260" y="240" width="6" height="6" fill="#4CAF50" opacity="0.25" transform="rotate(45 263 243)" />
                </svg>
            </div>

            {/* Bottom Right Illustration - Enhanced Realism */}
            <div className="fixed bottom-0 right-0 w-80 h-80 pointer-events-none">
                <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="platformGradR1" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#4A90E2" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#0052CC" stopOpacity="0.15" />
                        </linearGradient>
                        <linearGradient id="platformGradR2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0052CC" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#2684FF" stopOpacity="0.35" />
                        </linearGradient>
                        <linearGradient id="glassHandle" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FFB84D" />
                            <stop offset="50%" stopColor="#FF9800" />
                            <stop offset="100%" stopColor="#F57C00" />
                        </linearGradient>
                        <radialGradient id="glassLens">
                            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                            <stop offset="70%" stopColor="#E3F2FD" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#2684FF" stopOpacity="0.1" />
                        </radialGradient>
                        <linearGradient id="bugBody" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#FF8A80" />
                            <stop offset="100%" stopColor="#FF5252" />
                        </linearGradient>
                    </defs>

                    {/* Isometric Platform */}
                    <path d="M30 260 L180 190 L330 260 L180 330 Z" fill="url(#platformGradR1)" />
                    <path d="M30 260 L180 190 L180 210 L30 280 Z" fill="url(#platformGradR2)" />
                    <path d="M180 190 L330 260 L330 280 L180 210 Z" fill="#2684FF" opacity="0.4" />
                    <path d="M30 260 L180 190 L330 260 L180 330 Z" fill="#E3F2FD" opacity="0.5" />

                    {/* Character - Detailed */}
                    <ellipse cx="190" cy="250" rx="18" ry="6" fill="url(#shadowGrad)" />
                    {/* Legs */}
                    <rect x="185" y="235" width="5" height="15" rx="2.5" fill="#0052CC" />
                    <rect x="195" y="235" width="5" height="15" rx="2.5" fill="#0052CC" />
                    {/* Body */}
                    <rect x="182" y="210" width="20" height="28" rx="3" fill="url(#characterBlue)" />
                    {/* Arm holding magnifier */}
                    <path d="M182 218 Q160 210 145 220" stroke="#2684FF" strokeWidth="5" strokeLinecap="round" />
                    <circle cx="145" cy="220" r="4" fill="#4A90E2" />
                    {/* Other arm */}
                    <path d="M202 220 Q208 228 205 235" stroke="#0052CC" strokeWidth="4" strokeLinecap="round" />
                    {/* Head */}
                    <circle cx="192" cy="205" r="9" fill="#5BA3F5" />
                    <circle cx="192" cy="203" r="8" fill="#64B5F6" />
                    {/* Face */}
                    <circle cx="189" cy="204" r="1.5" fill="#fff" />
                    <circle cx="195" cy="204" r="1.5" fill="#fff" />
                    <circle cx="189.5" cy="204.5" r="0.8" fill="#333" />
                    <circle cx="195.5" cy="204.5" r="0.8" fill="#333" />
                    <path d="M189 207 Q192 208 195 207" stroke="#fff" strokeWidth="0.8" fill="none" opacity="0.7" />

                    {/* Magnifying Glass - Highly Detailed */}
                    <g transform="translate(100, 180)">
                        {/* Glass lens with gradient and shine */}
                        <circle cx="30" cy="30" r="28" fill="url(#glassLens)" />
                        <circle cx="30" cy="30" r="28" fill="none" stroke="#FF9800" strokeWidth="3" />
                        <circle cx="30" cy="30" r="26" fill="none" stroke="#FFB74D" strokeWidth="1" opacity="0.5" />
                        {/* Glass shine effect */}
                        <ellipse cx="22" cy="22" rx="8" ry="12" fill="white" opacity="0.4" transform="rotate(-45 22 22)" />
                        <ellipse cx="38" cy="38" rx="4" ry="6" fill="white" opacity="0.2" transform="rotate(-45 38 38)" />

                        {/* Handle with gradient */}
                        <path d="M50 50 L68 68" stroke="url(#glassHandle)" strokeWidth="6" strokeLinecap="round" />
                        <path d="M52 52 L70 70" stroke="#FFA726" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                        <circle cx="50" cy="50" r="4" fill="#FF9800" />

                        {/* Bug inside magnifier - Detailed */}
                        <g transform="translate(30, 30)">
                            {/* Bug body */}
                            <ellipse cx="0" cy="5" rx="11" ry="9" fill="url(#bugBody)" />
                            <ellipse cx="0" cy="5" rx="9" ry="7" fill="#FF6B6B" />
                            {/* Segments */}
                            <line x1="-8" y1="5" x2="8" y2="5" stroke="#D32F2F" strokeWidth="0.5" opacity="0.5" />
                            <line x1="-6" y1="2" x2="6" y2="2" stroke="#D32F2F" strokeWidth="0.5" opacity="0.5" />
                            <line x1="-6" y1="8" x2="6" y2="8" stroke="#D32F2F" strokeWidth="0.5" opacity="0.5" />
                            {/* Head */}
                            <ellipse cx="0" cy="-3" rx="6" ry="5" fill="#FF5252" />
                            {/* Eyes */}
                            <circle cx="-2.5" cy="-3" r="1.5" fill="#333" />
                            <circle cx="2.5" cy="-3" r="1.5" fill="#333" />
                            <circle cx="-2" cy="-3.5" r="0.6" fill="#fff" opacity="0.7" />
                            <circle cx="3" cy="-3.5" r="0.6" fill="#fff" opacity="0.7" />
                            {/* Antennae */}
                            <path d="M-3 -6 Q-5 -10 -4 -12" stroke="#D32F2F" strokeWidth="1" strokeLinecap="round" fill="none" />
                            <path d="M3 -6 Q5 -10 4 -12" stroke="#D32F2F" strokeWidth="1" strokeLinecap="round" fill="none" />
                            <circle cx="-4" cy="-12" r="1.5" fill="#FF9800" />
                            <circle cx="4" cy="-12" r="1.5" fill="#FF9800" />
                            {/* Legs - 6 legs */}
                            <path d="M-9 2 L-14 0" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M-9 6 L-14 8" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M-9 10 L-14 14" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M9 2 L14 0" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M9 6 L14 8" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />
                            <path d="M9 10 L14 14" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />
                            {/* Wings */}
                            <ellipse cx="-4" cy="4" rx="5" ry="7" fill="white" opacity="0.3" transform="rotate(-20 -4 4)" />
                            <ellipse cx="4" cy="4" rx="5" ry="7" fill="white" opacity="0.3" transform="rotate(20 4 4)" />
                        </g>
                    </g>

                    {/* Floating Code Elements - More Detailed */}
                    <g opacity="0.4" transform="translate(240, 150)">
                        {/* Code window */}
                        <rect x="0" y="0" width="80" height="60" rx="3" fill="white" stroke="#BDBDBD" strokeWidth="1" />
                        <rect x="0" y="0" width="80" height="8" fill="#E0E0E0" />
                        <circle cx="4" cy="4" r="1.5" fill="#FF5252" />
                        <circle cx="9" cy="4" r="1.5" fill="#FFC107" />
                        <circle cx="14" cy="4" r="1.5" fill="#4CAF50" />
                        {/* Code lines */}
                        <line x1="5" y1="15" x2="50" y2="15" stroke="#0052CC" strokeWidth="2" />
                        <line x1="10" y1="22" x2="45" y2="22" stroke="#2684FF" strokeWidth="1.5" />
                        <line x1="10" y1="29" x2="55" y2="29" stroke="#0052CC" strokeWidth="2" />
                        <line x1="5" y1="36" x2="40" y2="36" stroke="#2684FF" strokeWidth="1.5" />
                        <rect x="15" y="44" width="10" height="10" fill="#FF9800" opacity="0.6" rx="1" />
                        <text x="18" y="51" fill="white" fontSize="6" fontFamily="monospace">!</text>
                    </g>

                    {/* Floating particles */}
                    <circle cx="290" cy="200" r="3" fill="#64B5F6" opacity="0.3" />
                    <circle cx="310" cy="240" r="4" fill="#FFB74D" opacity="0.3" />
                    <rect x="270" y="260" width="5" height="5" fill="#FF5252" opacity="0.25" transform="rotate(45 272.5 262.5)" />
                </svg>
            </div>

            {/* Logo - Bug Icon */}
            <div className="mb-8 z-10">
                <div className="flex items-center gap-3">
                    {/* Bug Icon */}
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Bug Body */}
                        <ellipse cx="20" cy="24" rx="12" ry="14" fill="#0052CC" />
                        <ellipse cx="20" cy="24" rx="10" ry="12" fill="#2684FF" />

                        {/* Bug Head */}
                        <circle cx="20" cy="12" r="7" fill="#0052CC" />
                        <circle cx="20" cy="12" r="5.5" fill="#2684FF" />

                        {/* Eyes */}
                        <circle cx="17" cy="11" r="2" fill="white" />
                        <circle cx="23" cy="11" r="2" fill="white" />
                        <circle cx="17.5" cy="11" r="1" fill="#172B4D" />
                        <circle cx="23.5" cy="11" r="1" fill="#172B4D" />

                        {/* Antennae */}
                        <path d="M15 8 Q12 5 10 3" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" fill="none" />
                        <path d="M25 8 Q28 5 30 3" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" fill="none" />
                        <circle cx="10" cy="3" r="2" fill="#FF6B6B" />
                        <circle cx="30" cy="3" r="2" fill="#FF6B6B" />

                        {/* Legs */}
                        <path d="M10 20 L4 18" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10 26 L4 28" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
                        <path d="M10 32 L4 36" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
                        <path d="M30 20 L36 18" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
                        <path d="M30 26 L36 28" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />
                        <path d="M30 32 L36 36" stroke="#0052CC" strokeWidth="2" strokeLinecap="round" />

                        {/* Wing pattern */}
                        <ellipse cx="20" cy="22" rx="6" ry="8" fill="none" stroke="white" strokeWidth="1" opacity="0.3" />
                    </svg>

                    {/* BugMind Text */}
                    <div className="text-2xl font-bold text-[#172B4D]">
                        BugMind
                    </div>
                </div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-[400px] bg-white rounded-md shadow-sm border border-gray-200 p-8 z-10">
                <div className="text-center mb-6">
                    <h1 className="text-xl font-semibold text-[#172B4D] mb-2">
                        Log in to your BugMind account
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[#172B4D] mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-[#FAFBFC] text-[#172B4D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] transition-all"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[#172B4D] mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-[#FAFBFC] text-[#172B4D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-[#0052CC] transition-all"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-[#0052CC] text-white font-medium rounded hover:bg-[#0747A6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/auth/signup"
                        className="text-sm text-[#0052CC] hover:underline"
                    >
                        Sign up for an account
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center gap-4 text-xs text-gray-500 z-10">
                <span className="text-gray-400">•</span>
                <span>This site is protected by reCAPTCHA and the Google</span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs z-10">
                <Link href="#" className="text-[#0052CC] hover:underline">
                    Privacy Policy
                </Link>
                <span className="text-gray-400">•</span>
                <Link href="#" className="text-[#0052CC] hover:underline">
                    User Notice
                </Link>
            </div>
        </div>
    )
}

