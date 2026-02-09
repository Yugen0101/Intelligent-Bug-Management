'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BugList } from '@/components/bugs/BugList'
import { Bug, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DeveloperDashboard() {
    const [stats, setStats] = useState({ assigned: 0, inProgress: 0, resolvedToday: 0 })
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchStats() {
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
                    .select('status')
                    .in('id', bugIds)

                if (bugs) {
                    setStats({
                        assigned: bugs.length,
                        inProgress: bugs.filter(b => b.status === 'in_progress').length,
                        resolvedToday: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length
                    })
                }
            }
        }
        fetchStats()
    }, [])

    return (
        <DashboardLayout role="developer">
            <div className="space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-tight">
                            Developer <span className="text-indigo-500">Node</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-xl">
                            Active task stream. Monitoring assigned anomalies and resolution progress.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard
                        title="Active Assignments"
                        value={stats.assigned}
                        icon={<Bug className="w-6 h-6" />}
                        color="indigo"
                    />
                    <StatCard
                        title="Processing"
                        value={stats.inProgress}
                        icon={<Clock className="w-6 h-6" />}
                        color="purple"
                    />
                    <StatCard
                        title="Resolved Core"
                        value={stats.resolvedToday}
                        icon={<CheckCircle className="w-6 h-6" />}
                        color="emerald"
                    />
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">My Task Queue</h2>
                    <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                        {userId && <BugList role="developer" assignedTo={userId} limit={10} />}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    const iconColors: Record<string, string> = {
        indigo: 'text-indigo-400',
        purple: 'text-purple-400',
        emerald: 'text-emerald-400'
    }

    const glowColors: Record<string, string> = {
        indigo: 'shadow-indigo-500/20',
        purple: 'shadow-purple-500/20',
        emerald: 'shadow-emerald-500/20'
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
