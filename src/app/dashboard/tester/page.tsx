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
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                            Tester <span className="text-blue-600">Dashboard</span>
                        </h1>
                        <p className="text-gray-600 font-medium">
                            Report new bugs and track the progress of your submissions.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/tester/bugs/new"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-sm active:scale-95 text-sm group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                        Report Bug
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

                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Your Submissions</h2>
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <BugList role="tester" limit={6} />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    const iconColors: Record<string, string> = {
        indigo: 'text-indigo-600',
        emerald: 'text-emerald-600',
        amber: 'text-amber-600'
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

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
