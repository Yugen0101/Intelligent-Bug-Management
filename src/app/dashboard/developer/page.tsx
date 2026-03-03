'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
    Bug,
    CheckCircle2,
    Clock,
    TrendingUp,
    Activity,
    Target,
    Zap,
    AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIAssistantWidget } from '@/components/dashboard/AIAssistantWidget'
import { ResolutionRateGauge } from '@/components/dashboard/ResolutionRateGauge'
import { BugList } from '@/components/bugs/BugList'

// Fallback data for charts
const FALLBACK_TREND = [30, 45, 38, 52, 48, 60, 55, 68, 62, 75, 70, 82]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function DeveloperDashboard() {
    const [stats, setStats] = useState({ assigned: 0, inProgress: 0, resolved: 0, critical: 0 })
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

                const { data: assignments } = await supabase
                    .from('bug_assignments')
                    .select('bug_id')
                    .eq('assigned_to', user.id)

                if (assignments && assignments.length > 0) {
                    const bugIds = assignments.map(a => a.bug_id)
                    const { data: bugs } = await supabase
                        .from('bugs')
                        .select('status, severity')
                        .in('id', bugIds)

                    if (bugs) {
                        setStats({
                            assigned: bugs.length,
                            inProgress: bugs.filter(b => b.status === 'in_progress').length,
                            resolved: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
                            critical: bugs.filter(b => b.severity === 'critical').length
                        })
                    }
                }
            } catch (err) {
                console.error('Fetch Stats Error:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    const resolutionRate = stats.assigned > 0 ? Math.round((stats.resolved / stats.assigned) * 100) : 0

    // Build inline SVG trend chart
    const trendData = FALLBACK_TREND
    const maxTrend = Math.max(...trendData, 1)
    const svgW = 600
    const svgH = 110
    const pts = trendData.map((v, i) => {
        const x = (i / (trendData.length - 1)) * svgW
        const y = svgH - (v / maxTrend) * svgH * 0.85
        return `${x},${y}`
    })
    const linePath = `M ${pts.join(' L ')}`
    const areaPath = `M 0,${svgH} L ${pts.join(' L ')} L ${svgW},${svgH} Z`

    return (
        <DashboardLayout role="developer">
            <div className="space-y-5 pb-10">
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Developer Portal</h1>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Manage your workspace and resolve assigned issues</p>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'My Assignments', value: stats.assigned, change: '+2', icon: <Bug className="w-4 h-4 text-indigo-500" />, bg: 'bg-indigo-50', bars: [20, 40, 30, 60, 45, 70], neg: false },
                        { title: 'In Progress', value: stats.inProgress, change: '-1', icon: <Activity className="w-4 h-4 text-purple-500" />, bg: 'bg-purple-50', bars: [40, 60, 50, 80, 70, 90], neg: true },
                        { title: 'Resolved', value: stats.resolved, change: '+5', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50', bars: [30, 50, 40, 70, 60, 85], neg: false },
                        { title: 'Critical Task', value: stats.critical, change: '0', icon: <AlertTriangle className="w-4 h-4 text-rose-500" />, bg: 'bg-rose-50', bars: [60, 50, 55, 45, 40, 30], neg: false },
                    ].map((card) => (
                        <div key={card.title} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
                                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', card.bg)}>{card.icon}</div>
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{isLoading ? '—' : card.value}</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md', card.neg ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')}>
                                    {card.change} <span className="font-medium text-gray-400">active</span>
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

                {/* ── Main Content ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                    <div className="lg:col-span-2 space-y-5">
                        {/* Workload Trend Chart */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Workload History</h3>
                                <span className="flex items-center gap-1 text-emerald-500 text-[11px] font-black">
                                    <TrendingUp className="w-3.5 h-3.5" /> +12.5% performance
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">{resolutionRate}%</span>
                                <span className="text-[11px] font-bold text-gray-400">avg resolution rate</span>
                            </div>

                            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 120 }} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.01" />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill="url(#dg)" />
                                <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                {trendData.map((v, i) => {
                                    const x = (i / (trendData.length - 1)) * svgW
                                    const y = svgH - (v / maxTrend) * svgH * 0.85
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

                        {/* Assigned Bugs List */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">My Assigned Bugs</h3>
                                <button className="flex items-center gap-1 text-[11px] font-black text-indigo-500 hover:text-indigo-700 transition-colors uppercase">
                                    Manage All Issue <Zap className="w-3 h-3" />
                                </button>
                            </div>
                            {userId && <BugList role="developer" assignedTo={userId} limit={5} />}
                        </div>
                    </div>

                    {/* Right column sidebar */}
                    <div className="space-y-5">
                        <ResolutionRateGauge
                            percentage={resolutionRate}
                            title="My Resolve Rate"
                            subtitle="Resolution vs Assigned"
                        />
                        <AIAssistantWidget />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
