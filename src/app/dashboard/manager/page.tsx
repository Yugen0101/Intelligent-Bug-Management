'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BugList } from '@/components/bugs/BugList'
import {
    BarChart3,
    Users,
    Zap,
    Bug,
    AlertTriangle,
    PieChart as PieIcon,
    Download,
    TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

const BugDistributionPie = dynamic(() => import('@/components/analytics/AnalyticsCharts').then(mod => mod.BugDistributionPie), { ssr: false })
const SeverityBarChart = dynamic(() => import('@/components/analytics/AnalyticsCharts').then(mod => mod.SeverityBarChart), { ssr: false })
const PerformanceTrendLine = dynamic(() => import('@/components/analytics/AnalyticsCharts').then(mod => mod.PerformanceTrendLine), { ssr: false })
const WorkloadRadar = dynamic(() => import('@/components/analytics/AnalyticsCharts').then(mod => mod.WorkloadRadar), { ssr: false })

export default function ManagerDashboard() {
    const [stats, setStats] = useState({ totalBugs: 0, activeProjects: 0, unassigned: 0, critical: 0 })
    const [analytics, setAnalytics] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true)
            try {
                // 1. Fetch Basic Stats
                const { count: bugCount } = await supabase.from('bugs').select('*', { count: 'exact', head: true })
                const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true })
                const { count: criticalCount } = await supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('severity', 'critical')
                const { data: assignments } = await supabase.from('bug_assignments').select('bug_id')
                const assignedIds = new Set(assignments?.map(a => a.bug_id) || [])
                const { data: allBugs } = await supabase.from('bugs').select('id')
                const unassignedCount = allBugs?.filter(b => !assignedIds.has(b.id)).length || 0

                setStats({
                    totalBugs: bugCount || 0,
                    activeProjects: projectCount || 0,
                    critical: criticalCount || 0,
                    unassigned: unassignedCount
                })

                // 2. Fetch Detailed Analytics
                const response = await fetch('/api/ai/analytics')
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
    }, [])

    const exportData = () => {
        if (!analytics) return
        const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bug-analytics-${new Date().toISOString().split('T')[0]}.json`
        a.click()
    }

    return (
        <DashboardLayout role="manager">
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
                            Command <span className="text-indigo-500">Center</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-xl">
                            Neural node oversight. Real-time bug stream analysis and tactical distribution.
                        </p>
                    </div>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] group"
                    >
                        <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        Extract Intel
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Issues"
                        value={stats.totalBugs}
                        icon={<Bug className="w-6 h-6 text-blue-600" />}
                        color="blue"
                    />
                    <StatCard
                        title="Active Projects"
                        value={stats.activeProjects}
                        icon={<Zap className="w-6 h-6 text-amber-600" />}
                        color="amber"
                    />
                    <StatCard
                        title="Unassigned"
                        value={stats.unassigned}
                        icon={<Users className="w-6 h-6 text-purple-600" />}
                        color="purple"
                    />
                    <StatCard
                        title="Critical"
                        value={stats.critical}
                        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
                        color="red"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Charts */}
                    <div className="lg:col-span-2 space-y-10">
                        <section className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full pointer-events-none" />
                            <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                                <TrendingUp className="w-6 h-6 text-indigo-400" />
                                Efficiency Trajectory
                            </h3>
                            <div className="relative h-[350px]">
                                {analytics?.efficiency && <PerformanceTrendLine data={analytics.efficiency} />}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <section className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                                <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                                    <PieIcon className="w-5 h-5 text-indigo-400" />
                                    Categorical Load
                                </h3>
                                {analytics?.categories && <BugDistributionPie data={analytics.categories} />}
                            </section>

                            <section className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl">
                                <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
                                    <BarChart3 className="w-5 h-5 text-rose-400" />
                                    Severity Matrix
                                </h3>
                                {analytics?.severities && <SeverityBarChart data={analytics.severities} />}
                            </section>
                        </div>
                    </div>

                    {/* Sidebar: Workload & Insights */}
                    <div className="space-y-10">
                        <section className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-[3rem] text-white border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                            <h3 className="font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest text-sm">
                                <Users className="w-5 h-5 text-indigo-400" />
                                Team Bandwidth
                            </h3>
                            {analytics?.workload && <WorkloadRadar data={analytics.workload} />}
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full"></div>
                        </section>

                        <section className="glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
                            <h3 className="font-black text-white mb-6 flex items-center gap-3 uppercase tracking-widest text-sm">
                                <Zap className="w-5 h-5 text-indigo-400" />
                                Neural Insight
                            </h3>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium mb-8">
                                {analytics?.categories?.find((c: any) => c.category === 'ui_ux')?.count > stats.totalBugs * 0.4 ? (
                                    "UI/UX anomalies detected in primary nodes. Visual regression suspected in global styling layers."
                                ) : (
                                    "Neural patterns stabilized. Resolution throughput optimized across all development sectors."
                                )}
                            </p>
                            <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl relative">
                                <div className="absolute top-2 right-4 flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-75" />
                                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse delay-150" />
                                </div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Tactical Memo</p>
                                <p className="text-xs text-white/90 font-bold italic leading-relaxed">
                                    "Redirecting compute resources to critical security fractures in the Auth-Gate module."
                                </p>
                            </div>
                        </section>

                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Live Bug Stream</h3>
                            <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                                <BugList role="manager" limit={5} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    const iconColors: Record<string, string> = {
        blue: 'text-indigo-400',
        amber: 'text-amber-400',
        purple: 'text-purple-400',
        red: 'text-rose-400'
    }

    const glowColors: Record<string, string> = {
        blue: 'shadow-indigo-500/20',
        amber: 'shadow-amber-500/20',
        purple: 'shadow-purple-500/20',
        red: 'shadow-rose-500/20'
    }

    return (
        <div className={cn(
            "glass-card p-10 rounded-[3rem] border border-white/10 shadow-2xl transition-all hover:scale-[1.05] duration-500 relative overflow-hidden group",
            glowColors[color]
        )}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-[40px] rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-colors">
                    <div className={iconColors[color]}>
                        {icon}
                    </div>
                </div>
                <span className="text-4xl font-black text-white tracking-tighter drop-shadow-2xl">
                    {value}
                </span>
            </div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">{title}</h3>
        </div>
    )
}
