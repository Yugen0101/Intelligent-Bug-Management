'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
    BarChart3,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Loader2,
    ShieldAlert,
    Lightbulb,
    Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function InsightsPage() {
    const [projects, setProjects] = useState<any[]>([])
    const [selectedProjectId, setSelectedProjectId] = useState<string>('')
    const [insight, setInsight] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function fetchProjects() {
            const { data } = await supabase.from('projects').select('id, name')
            if (data) {
                setProjects(data)
                if (data.length > 0) setSelectedProjectId(data[0].id)
            }
        }
        fetchProjects()
    }, [])

    useEffect(() => {
        if (!selectedProjectId) return

        async function fetchInsight() {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/ai/project-health?projectId=${selectedProjectId}`)
                if (res.ok) {
                    const data = await res.json()
                    setInsight(data)
                }
            } catch (err) {
                console.error('Insight Fetch Error:', err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchInsight()
    }, [selectedProjectId])

    const riskColors = {
        low: 'text-emerald-500 bg-emerald-50 border-emerald-100',
        medium: 'text-amber-500 bg-amber-50 border-amber-100',
        high: 'text-rose-500 bg-rose-50 border-rose-100'
    }

    return (
        <DashboardLayout role="manager">
            <div className="space-y-8 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Insights & Health</h1>
                        <p className="text-gray-500 font-medium">Predictive analytics and project risk assessment.</p>
                    </div>

                    <div className="relative min-w-[250px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 shadow-lg rounded-2xl text-sm font-bold text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                        <p className="text-gray-500 font-bold animate-pulse">Gemini is analyzing project data...</p>
                    </div>
                ) : insight ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-xl">
                                <TrendingUp className="w-8 h-8 text-blue-600 mb-4" />
                                <div className="text-3xl font-black text-gray-900 capitalize">{insight.riskLevel}</div>
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Calculated Risk Level</div>
                            </div>

                            <div className="md:col-span-2 p-8 bg-indigo-600 text-white rounded-[2rem] shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-amber-300" />
                                        Executive Summary
                                    </h3>
                                    <p className="text-indigo-50 font-medium leading-relaxed">
                                        {insight.summary}
                                    </p>
                                </div>
                                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 blur-[60px] rounded-full"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <section className="p-8 bg-gray-900 text-white rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-rose-400">
                                        <ShieldAlert className="w-7 h-7" />
                                        Risk Areas & Anomalies
                                    </h2>
                                    <div className="space-y-4">
                                        {insight.anomalies.map((anomaly: string, i: number) => (
                                            <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/10 flex gap-4 items-start">
                                                <div className="w-2 h-2 mt-2 rounded-full bg-rose-500 shrink-0" />
                                                <p className="text-gray-300 font-medium">{anomaly}</p>
                                            </div>
                                        ))}
                                        {insight.anomalies.length === 0 && (
                                            <p className="text-gray-500 italic">No significant anomalies detected in recent data.</p>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose-600/10 blur-[100px] rounded-full"></div>
                            </section>

                            <section className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2 text-emerald-500">
                                    <CheckCircle2 className="w-7 h-7" />
                                    Strategic Recommendations
                                </h2>
                                <div className="space-y-4">
                                    {insight.recommendations.map((rec: string, i: number) => (
                                        <div key={i} className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4 items-start">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            </div>
                                            <p className="text-emerald-900 font-bold">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">Select a project to generate AI health insights.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
