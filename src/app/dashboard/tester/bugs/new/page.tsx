'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import {
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Sparkles,
    Loader2
} from 'lucide-react'
import Link from 'next/link'
import { BugForm } from '@/components/bugs/BugForm'
import { cn } from '@/lib/utils'
import type { Project, BugCategory, BugSeverity } from '@/types/database'

const bugSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    project_id: z.string().uuid('Please select a project'),
    category: z.enum(['ui_ux', 'functional', 'performance', 'security', 'data_logic', 'integration']).optional(),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
})

type BugFormValues = z.infer<typeof bugSchema>

export default function NewBugPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const onSubmit = async (values: BugFormValues, aiMetadata?: any) => {
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { embedding, ...remainingMetadata } = aiMetadata || {}

            const { data, error: insertError } = await supabase
                .from('bugs')
                .insert({
                    ...values,
                    created_by: user.id,
                    status: 'open',
                    embedding: embedding || null,
                    ai_metadata: remainingMetadata || {}
                })
                .select()
                .single()

            if (insertError) throw insertError

            setSuccess(true)
            setTimeout(() => router.push('/dashboard/tester'), 2000)
        } catch (err: any) {
            setError(err.message || 'Failed to submit bug report')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <DashboardLayout role="tester">
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="w-20 h-20 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Bug Reported Successfully</h1>
                        <p className="text-gray-600 font-medium">
                            Your report has been cataloged. Redirecting to dashboard...
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="tester">
            <div className="max-w-4xl mx-auto py-12 px-6">
                <Link
                    href="/dashboard/tester"
                    className="group inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-all font-bold uppercase tracking-wider text-[10px]"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden relative">
                    <div className="p-10 border-b border-gray-100">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Report <span className="text-blue-600">New Bug</span></h1>
                        </div>
                        <p className="text-gray-600 font-medium max-w-xl leading-relaxed">
                            Provide details about the issue. AI analysis will help classify the category and severity.
                        </p>
                    </div>

                    <div className="p-10">
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Error Submitting Report</p>
                                    <p className="text-[11px] font-medium opacity-80">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 shadow-inner">
                            <BugForm
                                onSubmit={onSubmit}
                                isLoading={loading}
                                submitLabel="Submit Bug Report"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
