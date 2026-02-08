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

            // Fetch bugs assigned to this developer
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
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Developer Dashboard</h1>
                    <p className="text-gray-500 font-medium">Focus on your assigned issues and track your progress.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Assigned to Me"
                        value={stats.assigned}
                        icon={<Bug className="w-6 h-6 text-indigo-600" />}
                        color="indigo"
                    />
                    <StatCard
                        title="In Progress"
                        value={stats.inProgress}
                        icon={<Clock className="w-6 h-6 text-purple-600" />}
                        color="purple"
                    />
                    <StatCard
                        title="Resolved"
                        value={stats.resolvedToday}
                        icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
                        color="emerald"
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Your Assigned Tasks</h2>
                    {userId && <BugList role="developer" assignedTo={userId} limit={10} />}
                </div>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    const shadowColors: Record<string, string> = {
        indigo: 'shadow-indigo-50',
        purple: 'shadow-purple-50',
        emerald: 'shadow-emerald-50'
    }

    const bgColors: Record<string, string> = {
        indigo: 'bg-indigo-50',
        purple: 'bg-purple-50',
        emerald: 'bg-emerald-50'
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
