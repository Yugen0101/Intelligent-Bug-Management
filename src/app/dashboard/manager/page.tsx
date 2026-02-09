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
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                            Manager <span className="text-blue-600">Dashboard</span>
                        </h1>
                        <p className="text-gray-600 font-medium">
                            Overview of project health, bug distribution, and team workload.
                        </p>
                    </div>
                    <button
                        onClick={exportData}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-all active:scale-95 shadow-sm group"
                    >
                        <Download className="w-4 h-4" />
                        Export Data
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
                        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Efficiency Trend
                            </h3>
                            <div className="relative h-[350px]">
                                {analytics?.efficiency && <PerformanceTrendLine data={analytics.efficiency} />}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-md font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                                    <PieIcon className="w-4 h-4 text-blue-500" />
                                    Categories
                                </h3>
                                {analytics?.categories && <BugDistributionPie data={analytics.categories} />}
                            </section>

                            <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="text-md font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                                    <BarChart3 className="w-4 h-4 text-rose-500" />
                                    Severity
                                </h3>
                                {analytics?.severities && <SeverityBarChart data={analytics.severities} />}
                            </section>
                        </div>
                    </div>

                    {/* Sidebar: Workload & Insights */}
                    <div className="space-y-8">
                        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
                            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                                <Users className="w-4 h-4 text-blue-500" />
                                Team Workload
                            </h3>
                            {analytics?.workload && <WorkloadRadar data={analytics.workload} />}
                        </section>

                        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                                <Zap className="w-4 h-4 text-blue-500" />
                                AI Insights
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed mb-6">
                                {analytics?.categories?.find((c: any) => c.category === 'ui_ux')?.count > stats.totalBugs * 0.4 ? (
                                    "Significant UI/UX issues reported. Consider reviewing global styling components."
                                ) : (
                                    "System performance meets targets. Resolution rates are currently optimal."
                                )}
                            </p>
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl relative">
                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Observation</p>
                                <p className="text-xs text-blue-900 font-medium italic leading-relaxed">
                                    "Consistent patterns identified in authentication modules. Monitor closely."
                                </p>
                            </div>
                        </section>

                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Recent Activity</h3>
                            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-4">
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
        blue: 'text-blue-600',
        amber: 'text-amber-600',
        purple: 'text-purple-600',
        red: 'text-red-600',
        indigo: 'text-indigo-600',
        emerald: 'text-emerald-600'
    }


    return (
        <div className={cn(
            "bg-white p-8 rounded-2xl border border-gray-200 shadow-sm transition-all hover:shadow-md duration-300 relative overflow-hidden group",
        )}>
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 group-hover:border-gray-200 transition-colors">
                    <div className={iconColors[color]}>
                        {icon}
                    </div>
                </div>
                <span className="text-3xl font-bold text-gray-900 tracking-tight">
                    {value}
                </span>
            </div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">{title}</h3>
        </div>
    )
}
