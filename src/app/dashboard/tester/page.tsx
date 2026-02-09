'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BugList } from '@/components/bugs/BugList'
import Link from 'next/link'
import { Plus, Bug, CheckCircle, Clock } from 'lucide-react'

export default function TesterDashboard() {
    const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 })
    const supabase = createClient()

    useEffect(() => {
        async function fetchStats() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: bugs } = await supabase
                .from('bugs')
                .select('status')
                .eq('created_by', user.id)

            if (bugs) {
                setStats({
                    total: bugs.length,
                    resolved: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
                    pending: bugs.filter(b => b.status === 'open' || b.status === 'in_progress').length
                })
            }
        }
        fetchStats()
    }, [])

    return (
        <DashboardLayout role="tester">
            <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
                            Testing <span className="text-indigo-500">Core</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-xl">
                            Anomaly submission and resolution tracking. Neural classification in progress.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/tester/bugs/new"
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-[0.98] text-sm group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                        Report Anomaly
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard
                        title="Submissions"
                        value={stats.total}
                        icon={<Bug className="w-6 h-6" />}
                        color="indigo"
                    />
                    <StatCard
                        title="Neutralized"
                        value={stats.resolved}
                        icon={<CheckCircle className="w-6 h-6" />}
                        color="emerald"
                    />
                    <StatCard
                        title="Active Review"
                        value={stats.pending}
                        icon={<Clock className="w-6 h-6" />}
                        color="amber"
                    />
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Emission Logs</h2>
                    <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                        <BugList role="tester" limit={6} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    const iconColors: Record<string, string> = {
        indigo: 'text-indigo-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400'
    }

    const glowColors: Record<string, string> = {
        indigo: 'shadow-indigo-500/20',
        emerald: 'shadow-emerald-500/20',
        amber: 'shadow-amber-500/20'
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
                <span className="text-4xl font-black text-white tracking-tighter">
                    {value}
                </span>
            </div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-1">{title}</h3>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
