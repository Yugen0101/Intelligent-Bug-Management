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
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bug Reported Successfully!</h1>
                    <p className="text-gray-500 text-center">
                        Redirecting you back to the dashboard...
                    </p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="tester">
            <div className="max-w-3xl mx-auto py-8">
                <Link
                    href="/dashboard/tester"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-700">
                        <h1 className="text-2xl font-bold text-white">Report New Bug</h1>
                        <p className="text-blue-100 mt-1 opacity-90">
                            Provide as much detail as possible. Our AI will help classify the issue.
                        </p>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-red-800">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <BugForm
                            onSubmit={onSubmit}
                            isLoading={loading}
                            submitLabel="Report Bug & Analyze"
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
