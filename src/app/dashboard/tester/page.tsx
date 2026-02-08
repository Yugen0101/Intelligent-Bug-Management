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
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tester Dashboard</h1>
                        <p className="text-gray-500 font-medium">Manage your bug reports and track AI classifications.</p>
                    </div>
                    <Link
                        href="/dashboard/tester/bugs/new"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        Report New Bug
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total Reported"
                        value={stats.total}
                        icon={<Bug className="w-6 h-6 text-blue-600" />}
                        color="blue"
                    />
                    <StatCard
                        title="Resolved Bugs"
                        value={stats.resolved}
                        icon={<CheckCircle className="w-6 h-6 text-emerald-600" />}
                        color="emerald"
                    />
                    <StatCard
                        title="Pending Review"
                        value={stats.pending}
                        icon={<Clock className="w-6 h-6 text-amber-600" />}
                        color="amber"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Your Recent Bug Reports</h2>
                    </div>
                    <BugList role="tester" limit={6} />
                </div>
            </div>
        </DashboardLayout>
    )
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
    const shadowColors: Record<string, string> = {
        blue: 'shadow-blue-50',
        emerald: 'shadow-emerald-50',
        amber: 'shadow-amber-50'
    }

    return (
        <div className={cn(
            "p-6 bg-white rounded-3xl border border-gray-100 shadow-xl transition-all hover:scale-[1.02] duration-300",
            shadowColors[color]
        )}>
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl", `bg-${color}-50`)}>
                    {icon}
                </div>
                <span className="text-2xl font-black text-gray-900">{value}</span>
            </div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</h3>
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}
