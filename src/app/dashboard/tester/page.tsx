'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
    Bug,
    CheckCircle2,
    Clock,
    Plus,
    TrendingUp,
    Zap,
    ArrowUpRight,
    Search,
    Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { AIAssistantWidget } from '@/components/dashboard/AIAssistantWidget'
import { BugList } from '@/components/bugs/BugList'

// Fallback trend for "Submission History"
const FALLBACK_SUBMISSIONS = [12, 18, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function TesterDashboard() {
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0, verified: 0 })
    const [isLoading, setIsLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchStats() {
            setIsLoading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                setUserId(user.id)

                const { data: bugs } = await supabase
                    .from('bugs')
                    .select('status')
                    .eq('created_by', user.id)

                if (bugs) {
                    setStats({
                        total: bugs.length,
                        resolved: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
                        pending: bugs.filter(b => b.status === 'open' || b.status === 'in_progress').length,
                        verified: bugs.filter(b => b.status === 'closed').length // Example verification stat
                    })
                }
            } catch (err) {
                console.error('Fetch Stats Error:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    // SVG Chart Logic
    const trendData = FALLBACK_SUBMISSIONS
    const maxVal = Math.max(...trendData, 1)
    const svgW = 600
    const svgH = 110
    const pts = trendData.map((v, i) => {
        const x = (i / (trendData.length - 1)) * svgW
        const y = svgH - (v / maxVal) * svgH * 0.85
        return `${x},${y}`
    })
    const linePath = `M ${pts.join(' L ')}`
    const areaPath = `M 0,${svgH} L ${pts.join(' L ')} L ${svgW},${svgH} Z`

    return (
        <DashboardLayout role="tester">
            <div className="space-y-5 pb-10">
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tester Portal</h1>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Report bugs and track submission quality</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-[11px] font-bold text-gray-400">
                            <Search className="w-3.5 h-3.5" />
                            <span>Search submissions...</span>
                        </div>
                        <Link
                            href="/dashboard/tester/bugs/new"
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
                        >
                            <Plus className="w-4 h-4" />
                            Report New Bug
                        </Link>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Submissions', value: stats.total, change: '+12%', icon: <Bug className="w-4 h-4 text-indigo-500" />, bg: 'bg-indigo-50', bars: [30, 50, 40, 70, 60, 85], neg: false },
                        { title: 'Neutralized', value: stats.resolved, change: '+8%', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50', bars: [20, 40, 30, 60, 45, 75], neg: false },
                        { title: 'In Review', value: stats.pending, change: '-2', icon: <Clock className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50', bars: [80, 60, 70, 50, 40, 30], neg: true },
                        { title: 'Verified', value: stats.verified, change: '+5', icon: <Zap className="w-4 h-4 text-purple-500" />, bg: 'bg-purple-50', bars: [40, 50, 45, 65, 55, 80], neg: false },
                    ].map((card) => (
                        <div key={card.title} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
                                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', card.bg)}>{card.icon}</div>
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{isLoading ? '—' : card.value}</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md', card.neg ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')}>
                                    {card.change} <span className="font-medium text-gray-400">growth</span>
                                </span>
                                <div className="flex items-end gap-0.5 h-7">
                                    {card.bars.map((h, i) => (
                                        <div key={i} className={cn('w-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity', card.neg ? 'bg-rose-400' : 'bg-indigo-400')} style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Submission History Chart */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Submission History</h3>
                                <span className="flex items-center gap-1 text-emerald-500 text-[11px] font-black">
                                    <TrendingUp className="w-3.5 h-3.5" /> +15.2% quality score
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">{stats.total}</span>
                                <span className="text-[11px] font-bold text-gray-400">total reports filed</span>
                            </div>

                            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 120 }} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill="url(#tg)" />
                                <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                {trendData.map((v, i) => {
                                    const x = (i / (trendData.length - 1)) * svgW
                                    const y = svgH - (v / maxVal) * svgH * 0.85
                                    return <circle key={i} cx={x} cy={y} r="3.5" fill="#6366f1" stroke="white" strokeWidth="2" />
                                })}
                            </svg>

                            <div className="flex justify-between mt-1.5 px-0.5">
                                {trendData.map((_, i) => (
                                    <span key={i} className="text-[9px] font-bold text-gray-300">
                                        {MONTHS[(new Date().getMonth() - trendData.length + i + 12) % 12]}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recent Submissions List */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">My Recent Submissions</h3>
                                <button className="flex items-center gap-1 text-[11px] font-black text-indigo-500 hover:text-indigo-700 transition-colors uppercase">
                                    VIEW ALL <ArrowUpRight className="w-3 h-3" />
                                </button>
                            </div>
                            {userId && <BugList role="tester" limit={5} />}
                        </div>
                    </div>

                    {/* Right column sidebar */}
                    <div className="space-y-5">
                        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100 overflow-hidden relative group">
                            <div className="relative z-10">
                                <h3 className="text-[11px] font-black uppercase tracking-widest opacity-80 mb-4">Quality Score</h3>
                                <div className="text-4xl font-black mb-2">94.8%</div>
                                <p className="text-[10px] font-medium opacity-80 leading-relaxed mb-6">
                                    Your submissions are highly accurate. You are in the top 5% of testers.
                                </p>
                                <button className="w-full py-3 bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                                    View breakdown
                                </button>
                            </div>
                            {/* Decorative bubble */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
                        </div>

                        <AIAssistantWidget />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
