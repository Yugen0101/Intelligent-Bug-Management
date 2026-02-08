'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BugList } from '@/components/bugs/BugList'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function TesterBugsPage() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get('project') || undefined

    return (
        <DashboardLayout role="tester">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Bug Reports</h1>
                        <p className="text-gray-500 font-medium">Track and manage all bugs you've reported across projects.</p>
                    </div>
                    <Link
                        href="/dashboard/tester/bugs/new"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        Report New Bug
                    </Link>
                </div>

                <BugList role="tester" projectId={projectId} />
            </div>
        </DashboardLayout>
    )
}
