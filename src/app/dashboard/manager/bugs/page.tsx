'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BugList } from '@/components/bugs/BugList'
import { useSearchParams } from 'next/navigation'

import { Suspense } from 'react'

function ManagerBugsContent() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get('project') || undefined

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">All Bug Reports</h1>
                <p className="text-gray-500 font-medium">Monitor and manage all bug reports across all projects.</p>
            </div>

            <BugList role="manager" projectId={projectId} />
        </div>
    )
}

export default function ManagerBugsPage() {
    return (
        <DashboardLayout role="manager">
            <Suspense fallback={<div>Loading...</div>}>
                <ManagerBugsContent />
            </Suspense>
        </DashboardLayout>
    )
}
