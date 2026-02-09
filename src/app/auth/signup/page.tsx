'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { UserRole } from '@/types/database'
import { motion } from 'framer-motion'
import { UserPlus, Mail, Lock, User, ShieldCheck } from 'lucide-react'

export default function SignUpPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState<UserRole>('tester')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role,
                    },
                },
            })

            if (authError) throw authError

            if (authData.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        full_name: fullName,
                        role: role,
                    })

                if (profileError) throw profileError

                const dashboardPath = role === 'manager' ? '/dashboard/manager'
                    : role === 'developer' ? '/dashboard/developer'
                        : '/dashboard/tester'

                router.push(dashboardPath)
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during sign up')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden px-4 selection:bg-indigo-500/30">
            {/* Immersive Neural Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 mesh-gradient opacity-40" />
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
            </div>

            <div className="max-w-md w-full relative z-10 scale-95 md:scale-100">
                <div className="glass-card rounded-[3.5rem] p-10 md:p-12 border border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]">
                    <div className="text-center mb-10">
                        <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 group hover:scale-110 transition-transform">
                            <UserPlus className="w-8 h-8 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter mb-3 leading-tight">
                            Neural <span className="text-indigo-500">Identity</span>
                        </h1>
                        <p className="text-gray-400 font-medium">Create your credentials for Bug Mind</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium animate-shake">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Secure Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium"
                                    placeholder="your@neural.net"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Security Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pb-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">System Role</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value as UserRole)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-medium appearance-none"
                                >
                                    <option value="tester" className="bg-gray-900">Tester - Data Acquisition</option>
                                    <option value="developer" className="bg-gray-900">Developer - System Repair</option>
                                    <option value="manager" className="bg-gray-900">Manager - Neural Overseer</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all shadow-xl shadow-white/5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
                        >
                            {loading ? 'Processing...' : 'Initialize Account'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-sm font-medium text-gray-500">
                        Already initialized?{' '}
                        <Link href="/auth/login" className="text-white hover:text-indigo-400 transition-colors font-black uppercase tracking-widest text-[10px]">
                            Ascend to Portal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

