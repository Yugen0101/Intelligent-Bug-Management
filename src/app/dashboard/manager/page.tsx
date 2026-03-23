'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
    BarChart3,
    Users,
    Zap,
    Bug,
    AlertTriangle,
    Download,
    TrendingUp,
    ChevronDown,
    Calendar,
    Plus,
    ArrowUpRight,
    Activity,
    CheckCircle2,
    Clock,
    Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AIAssistantWidget } from '@/components/dashboard/AIAssistantWidget'
import { ResolutionRateGauge } from '@/components/dashboard/ResolutionRateGauge'
import { BugList } from '@/components/bugs/BugList'

// Fallback sparkline/chart data for immediate render
const FALLBACK_TREND = [42, 58, 51, 67, 60, 74, 68, 80, 72, 85, 78, 90]
const FALLBACK_SEVERITY = [
    { label: 'Critical', value: 12, color: '#ef4444' },
    { label: 'High', value: 28, color: '#f97316' },
    { label: 'Medium', value: 45, color: '#eab308' },
    { label: 'Low', value: 15, color: '#22c55e' },
]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ManagerDashboard() {
    const [selectedPeriod, setSelectedPeriod] = useState('30d')
    const [isPeriodOpen, setIsPeriodOpen] = useState(false)
    const [visibleWidgets, setVisibleWidgets] = useState({
        trend: true,
        distribution: true,
        gauge: true,
        ai: true,
    })
    const [stats, setStats] = useState({ totalBugs: 0, activeProjects: 0, unassigned: 0, critical: 0 })
    const [analytics, setAnalytics] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false)

    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                const { count: bugCount } = await supabase.from('bugs').select('*', { count: 'exact', head: true })
                const { count: projectCount } = await supabase.from('bugs').select('project_id', { count: 'exact', head: true })
                const { count: criticalCount } = await supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('severity', 'critical')
                const { data: assignments } = await supabase.from('bug_assignments').select('bug_id')
                const assignedIds = new Set(assignments?.map((a: any) => a.bug_id) || [])
                const { data: allBugs } = await supabase.from('bugs').select('id')
                const unassignedCount = allBugs?.filter((b: any) => !assignedIds.has(b.id)).length || 0

                setStats({
                    totalBugs: bugCount || 0,
                    activeProjects: projectCount || 0,
                    critical: criticalCount || 0,
                    unassigned: unassignedCount,
                })

                const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '90d' ? 90 : 30
                const response = await fetch(`/api/ai/analytics?days=${days}`)
                if (response.ok) {
                    const data = await response.json()
                    setAnalytics(data)
                }
            } catch (err) {
                console.error('Data Fetch Error:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [selectedPeriod])

    const exportData = () => {
        const exportContent = {
            metadata: { exportedAt: new Date().toISOString(), period: selectedPeriod, stats },
            data: analytics,
        }
        const blob = new Blob([JSON.stringify(exportContent, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bug-analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
    }

    const getDateRangeLabel = () => {
        const end = new Date()
        const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '90d' ? 90 : 30
        const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    }

    // Always use fallback until API returns data
    const trendData: number[] = analytics?.efficiency?.map((e: any) => e.rate) ?? FALLBACK_TREND
    const severityData = analytics?.severities
        ? Object.entries(analytics.severities).map(([key, val]: any) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: val,
            color:
                key === 'critical' ? '#ef4444' : key === 'high' ? '#f97316' : key === 'medium' ? '#eab308' : '#22c55e',
        }))
        : FALLBACK_SEVERITY

    const maxSeverity = Math.max(...severityData.map((d: any) => d.value), 1)
    const maxTrend = Math.max(...trendData, 1)

    // Build inline SVG area chart
    const svgW = 600
    const svgH = 110
    const pts = trendData.map((v, i) => {
        const x = (i / (trendData.length - 1)) * svgW
        const y = svgH - (v / maxTrend) * svgH * 0.88
        return `${x},${y}`
    })
    const linePath = `M ${pts.join(' L ')}`
    const areaPath = `M 0,${svgH} L ${pts.join(' L ')} L ${svgW},${svgH} Z`

    return (
        <DashboardLayout role="manager">
            {/* Widget Modal */}
            {isWidgetModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[28px] w-full max-w-md p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-gray-900">Customize Widgets</h2>
                            <button onClick={() => setIsWidgetModalOpen(false)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors">
                                <Plus className="w-4 h-4 text-gray-400 rotate-45" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {([
                                { id: 'trend', label: 'Efficiency Trend', desc: 'Performance analytics over time' },
                                { id: 'distribution', label: 'Severity Focus', desc: 'Bug density by impact level' },
                                { id: 'gauge', label: 'Resolution Rate', desc: 'Real-time closing efficiency' },
                                { id: 'ai', label: 'AI Assistant', desc: 'Smart triage & suggestions' },
                            ] as const).map((w) => (
                                <div key={w.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{w.label}</p>
                                        <p className="text-[11px] text-gray-400">{w.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => setVisibleWidgets((p) => ({ ...p, [w.id]: !p[w.id] }))}
                                        className={cn('w-12 h-6 rounded-full relative transition-colors duration-300', visibleWidgets[w.id] ? 'bg-blue-600' : 'bg-gray-200')}
                                    >
                                        <div className={cn('absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300', visibleWidgets[w.id] ? 'translate-x-6' : 'translate-x-0')} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsWidgetModalOpen(false)} className="w-full mt-6 py-3.5 bg-blue-600 text-white rounded-2xl text-[13px] font-black tracking-widest uppercase hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200">
                            Done
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-5 pb-10">
                {/* ── Header ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dashboard</h1>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Overview of all bug management activity</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 relative">
                        {/* Date range badge */}
                        <div className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[11px] font-bold text-gray-600 truncate max-w-[150px]">{getDateRangeLabel()}</span>
                        </div>

                        {/* Period selector */}
                        <div className="relative">
                            <button onClick={() => setIsPeriodOpen(!isPeriodOpen)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                                <span className="text-[11px] font-bold text-gray-600">
                                    {selectedPeriod === '7d' ? 'Last 7 days' : selectedPeriod === '90d' ? 'Last 90 days' : 'Last 30 days'}
                                </span>
                                <ChevronDown className={cn('w-3 h-3 text-gray-400 transition-transform', isPeriodOpen && 'rotate-180')} />
                            </button>
                            {isPeriodOpen && (
                                <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 p-1.5">
                                    {['7d', '30d', '90d'].map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => { setSelectedPeriod(p); setIsPeriodOpen(false) }}
                                            className={cn('w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-colors', selectedPeriod === p ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50')}
                                        >
                                            {p === '7d' ? 'Last 7 days' : p === '90d' ? 'Last 90 days' : 'Last 30 days'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={() => setIsWidgetModalOpen(true)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-100 rounded-xl shadow-sm text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors group">
                            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
                            Add widget
                        </button>
                        <button onClick={exportData} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100">
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>
                    </div>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { title: 'Total Issues', value: stats.totalBugs, change: '+15.5%', icon: <Bug className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50', bars: [35, 55, 40, 75, 50, 80], neg: false },
                        { title: 'Active Projects', value: stats.activeProjects, change: '+8.4%', icon: <Zap className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50', bars: [50, 70, 45, 80, 65, 90], neg: false },
                        { title: 'Unassigned', value: stats.unassigned, change: '-10.5%', icon: <Users className="w-4 h-4 text-rose-500" />, bg: 'bg-rose-50', bars: [80, 60, 70, 50, 45, 30], neg: true },
                        { title: 'Critical', value: stats.critical, change: '+4.4%', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50', bars: [30, 45, 38, 60, 42, 55], neg: false },
                    ].map((card) => (
                        <div key={card.title} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{card.title}</p>
                                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', card.bg)}>{card.icon}</div>
                            </div>
                            <p className="text-3xl font-black text-gray-900 tracking-tighter">{isLoading ? '—' : card.value}</p>
                            <div className="flex items-center justify-between mt-3">
                                <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md', card.neg ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600')}>
                                    {card.change} <span className="font-medium text-gray-400">vs last period</span>
                                </span>
                                <div className="flex items-end gap-0.5 h-7">
                                    {card.bars.map((h, i) => (
                                        <div key={i} className={cn('w-1.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity', card.neg ? 'bg-rose-400' : 'bg-blue-400')} style={{ height: `${h}%` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Charts Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Efficiency Trend – always visible, SVG driven */}
                    {visibleWidgets.trend && (
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Efficiency Trend</h3>
                                <span className="flex items-center gap-1 text-emerald-500 text-[11px] font-black">
                                    <TrendingUp className="w-3.5 h-3.5" /> +24.4% vs. last period
                                </span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-black text-gray-900 tracking-tighter">68%</span>
                                <span className="text-[11px] font-bold text-gray-400">resolution rate</span>
                            </div>

                            {/* Inline SVG Area Chart */}
                            <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ height: 120 }} preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
                                    </linearGradient>
                                </defs>
                                <path d={areaPath} fill="url(#ag)" />
                                <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                {trendData.map((v, i) => {
                                    const x = (i / (trendData.length - 1)) * svgW
                                    const y = svgH - (v / maxTrend) * svgH * 0.88
                                    return <circle key={i} cx={x} cy={y} r="3.5" fill="#2563eb" stroke="white" strokeWidth="2" />
                                })}
                            </svg>

                            {/* Month axis */}
                            <div className="flex justify-between mt-1.5 px-0.5">
                                {trendData.map((_, i) => (
                                    <span key={i} className="text-[9px] font-bold text-gray-300">
                                        {MONTHS[(new Date().getMonth() - trendData.length + i + 12) % 12]}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Severity Focus – always visible, CSS bars */}
                    {visibleWidgets.distribution && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Severity Focus</h3>
                                <BarChart3 className="w-4 h-4 text-gray-200" />
                            </div>

                            <div className="space-y-4 flex-1">
                                {severityData.map((item: any) => (
                                    <div key={item.label}>
                                        <div className="flex justify-between mb-1.5">
                                            <span className="text-[11px] font-black text-gray-800">{item.label}</span>
                                            <span className="text-[11px] font-black text-gray-400">{item.value}%</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(item.value / maxSeverity) * 100}%`, backgroundColor: item.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Status legend */}
                            <div className="mt-6 pt-5 border-t border-gray-50 grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Resolved', val: '68%', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
                                    { label: 'In Progress', val: '24%', icon: <Clock className="w-3.5 h-3.5 text-blue-500" /> },
                                    { label: 'Open', val: '8%', icon: <Activity className="w-3.5 h-3.5 text-amber-500" /> },
                                    { label: 'Target', val: '80%', icon: <Target className="w-3.5 h-3.5 text-gray-300" /> },
                                ].map((s) => (
                                    <div key={s.label} className="flex items-center gap-2">
                                        {s.icon}
                                        <div>
                                            <p className="text-[10px] text-gray-400">{s.label}</p>
                                            <p className="text-xs font-black text-gray-900">{s.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Bottom Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Recent Activity</h3>
                            <button className="flex items-center gap-1 text-[11px] font-black text-blue-500 hover:text-blue-700 transition-colors">
                                SEE ALL <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </div>
                        <BugList role="manager" limit={5} />
                    </div>

                    {/* Resolution Gauge + AI */}
                    <div className="space-y-5">
                        {visibleWidgets.gauge && <ResolutionRateGauge percentage={68} />}
                        {visibleWidgets.ai && <AIAssistantWidget />}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
