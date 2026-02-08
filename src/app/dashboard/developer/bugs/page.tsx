'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { BugList } from '@/components/bugs/BugList'
import { useSearchParams } from 'next/navigation'

export default function DeveloperBugsPage() {
    const searchParams = useSearchParams()
    const projectId = searchParams.get('project') || undefined
    const status = searchParams.get('status') || undefined

    return (
        <DashboardLayout role="developer">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Assigned Bugs</h1>
                    <p className="text-gray-500 font-medium">Manage and resolve bugs assigned to you.</p>
                </div>

                <BugList role="developer" projectId={projectId} />
            </div>
        </DashboardLayout>
    )
}
