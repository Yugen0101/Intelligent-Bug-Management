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
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="relative">
                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                        </div>
                        <div className="absolute -inset-4 border border-emerald-500/10 rounded-full animate-ping opacity-20" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-3">Anomaly Cataloged</h1>
                        <p className="text-gray-500 font-medium">
                            Neural submission complete. Redirecting to core node...
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
                    className="group inline-flex items-center gap-3 text-gray-500 hover:text-white mb-12 transition-all font-black uppercase tracking-widest text-[10px]"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Recall Protocol
                </Link>

                <div className="glass-card rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative">
                    {/* Header Glow */}
                    <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

                    <div className="p-12 border-b border-white/5 relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                <Sparkles className="w-6 h-6 text-indigo-400" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Emission <span className="text-indigo-500">Report</span></h1>
                        </div>
                        <p className="text-gray-400 font-medium max-w-xl leading-relaxed">
                            Input anomaly signatures. Neural analysis will initiate upon protocol submission to classify priority vectors.
                        </p>
                    </div>

                    <div className="p-12 relative z-10">
                        {error && (
                            <div className="mb-10 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex gap-4 text-rose-400">
                                <AlertCircle className="w-6 h-6 shrink-0" />
                                <div>
                                    <p className="text-sm font-black uppercase tracking-widest mb-1">Upload Interrupted</p>
                                    <p className="text-xs font-medium opacity-80">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-white/5 rounded-[2rem] border border-white/5 p-8">
                            <BugForm
                                onSubmit={onSubmit}
                                isLoading={loading}
                                submitLabel="Initialize Analysis & Catalog"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
