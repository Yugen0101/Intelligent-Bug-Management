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
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                            Developer <span className="text-blue-600">Dashboard</span>
                        </h1>
                        <p className="text-gray-600 font-medium">
                            Manage your assigned bugs and track resolution status.
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

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Assigned Bugs</h2>
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <BugList role="developer" limit={6} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    const iconColors: Record<string, string> = {
        indigo: 'text-indigo-600',
        purple: 'text-purple-600',
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
