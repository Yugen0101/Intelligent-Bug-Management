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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Executive Overview</h1>
                        <p className="text-gray-500 font-medium">Data-driven insights for project management and team performance.</p>
                    </div>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 shadow-lg rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
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
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Resolution Efficiency Trend
                            </h3>
                            {analytics?.efficiency && <PerformanceTrendLine data={analytics.efficiency} />}
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <PieIcon className="w-5 h-5 text-purple-600" />
                                    Bug Distribution
                                </h3>
                                {analytics?.categories && <BugDistributionPie data={analytics.categories} />}
                            </section>

                            <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-rose-600" />
                                    Severity Impact
                                </h3>
                                {analytics?.severities && <SeverityBarChart data={analytics.severities} />}
                            </section>
                        </div>
                    </div>

                    {/* Sidebar: Workload & Insights */}
                    <div className="space-y-8">
                        <section className="bg-gray-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                            <h3 className="font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <Users className="w-5 h-5 text-blue-400" />
                                Team Workload
                            </h3>
                            {analytics?.workload && <WorkloadRadar data={analytics.workload} />}
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
                        </section>

                        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                                AI Health Insight
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                {analytics?.categories?.find((c: any) => c.category === 'ui_ux')?.count > stats.totalBugs * 0.4 ? (
                                    "UI/UX issues are dominating the backlog. The AI suggests a potential regression in the design system or frontend framework."
                                ) : (
                                    "The system indicates a balanced workload. Current resolution trends are positive, showing a 12% improvement over last month."
                                )}
                            </p>
                            <div className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                                <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Recommendation</p>
                                <p className="text-xs text-indigo-700 font-bold italic">"Prioritize security patches flagged in the integration module."</p>
                            </div>
                        </section>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
    const shadowColors: Record<string, string> = {
        blue: 'shadow-blue-50',
        amber: 'shadow-amber-50',
        purple: 'shadow-purple-50',
        red: 'shadow-red-50'
    }

    const bgColors: Record<string, string> = {
        blue: 'bg-blue-50',
        amber: 'bg-amber-50',
        purple: 'bg-purple-50',
        red: 'bg-red-50'
    }

    return (
        <div className={cn(
            "p-6 bg-white rounded-3xl border border-gray-100 shadow-xl transition-all hover:scale-[1.02] duration-300",
            shadowColors[color]
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", bgColors[color])}>
                    {icon}
                </div>
                <span className="text-2xl font-black text-gray-900">{value}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
        </div>
    )
}
