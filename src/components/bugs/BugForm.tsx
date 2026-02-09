'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import {
    AlertCircle,
    AlertTriangle,
    Sparkles,
    Loader2,
    Info,
    ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DuplicateBugCard } from './DuplicateBugCard'
import { ConfidenceBadge, ReasoningModal } from '@/components/ui/AIExplainability'
import type { DuplicateResult } from '@/lib/ai/duplicates'
import type { Project, BugCategory, BugSeverity, Bug } from '@/types/database'

const bugSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    project_id: z.string().uuid('Please select a project'),
    category: z.enum(['ui_ux', 'functional', 'performance', 'security', 'data_logic', 'integration']).optional(),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
})

export type BugFormValues = z.infer<typeof bugSchema>

interface BugFormProps {
    initialData?: Partial<Bug>
    onSubmit: (values: any, aiMetadata?: any) => Promise<void>
    isLoading?: boolean
    submitLabel?: string
}

export function BugForm({ initialData, onSubmit, isLoading, submitLabel = 'Submit' }: BugFormProps) {
    const [projects, setProjects] = useState<Project[]>([])
    const [isPredicting, setIsPredicting] = useState(false)
    const [prediction, setPrediction] = useState<any>(null)
    const [nlpResult, setNlpResult] = useState<any>(null)
    const [duplicates, setDuplicates] = useState<DuplicateResult[]>([])
    const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false)
    const [duplicateOf, setDuplicateOf] = useState<string | null>(null)
    const [isReasoningOpen, setIsReasoningOpen] = useState(false)

    const supabase = createClient()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<BugFormValues>({
        resolver: zodResolver(bugSchema),
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            project_id: initialData?.project_id || '',
            category: initialData?.category || undefined,
            severity: initialData?.severity || undefined,
        }
    })

    const title = watch('title')
    const description = watch('description')
    const projectId = watch('project_id')

    useEffect(() => {
        async function fetchProjects() {
            const { data } = await supabase.from('projects').select('*').order('name')
            if (data) setProjects(data)
        }
        fetchProjects()
    }, [])

    useEffect(() => {
        const analyzeText = async () => {
            if (title?.length > 10 && description?.length > 30 && !isPredicting && !initialData) {
                setIsPredicting(true)
                try {
                    // 1. Get NLP Analysis (Embeddings/Keywords)
                    const nlpResponse = await fetch('/api/nlp/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: description })
                    })
                    const nlpData = await nlpResponse.json()
                    setNlpResult(nlpData)

                    // 2. Get High-Accuracy Gemini Prediction
                    const predictionResponse = await fetch('/api/ai/predict-bug', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ title, description })
                    })

                    if (!predictionResponse.ok) throw new Error('ML Prediction failed')

                    const predictionData = await predictionResponse.json()
                    setPrediction(predictionData)

                    // 3. New: Check for Duplicates
                    setIsCheckingDuplicates(true)
                    const dupResponse = await fetch('/api/ai/check-duplicates', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ description, project_id: projectId })
                    })
                    if (dupResponse.ok) {
                        const dupData = await dupResponse.json()
                        setDuplicates(dupData)
                    }
                } catch (err) {
                    console.error('Analysis Error:', err)
                } finally {
                    setIsPredicting(false)
                    setIsCheckingDuplicates(false)
                }
            }
        }

        const debounceTimer = setTimeout(() => {
            analyzeText()
        }, 1500)

        return () => clearTimeout(debounceTimer)
    }, [title, description, projectId, initialData])

    const applyAISuggestion = () => {
        if (prediction) {
            setValue('category', prediction.category)
            setValue('severity', prediction.severity)
        }
    }

    const handleFormSubmit = async (values: BugFormValues) => {
        const aiMetadata = prediction ? {
            category_prediction: {
                prediction: prediction.category,
                actual: values.category || prediction.category,
                confidence: prediction.confidence.category,
                explanation: prediction.explanation
            },
            severity_prediction: {
                prediction: prediction.severity,
                actual: values.severity || prediction.severity,
                confidence: prediction.confidence.severity,
                explanation: prediction.explanation
            },
            nlp_analysis: {
                entities: nlpResult?.entities || [],
                keywords: nlpResult?.keywords || []
            }
        } : initialData?.ai_metadata || {}

        await onSubmit({
            ...values,
            status: duplicateOf ? 'duplicate' : (initialData?.status || 'open'),
            duplicate_of: duplicateOf || null
        }, {
            ...aiMetadata,
            embedding: nlpResult?.embedding
        })
    }

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-12">
            <div className="space-y-10">
                {/* Project Selection */}
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                        Deployment Sector (Project)
                    </label>
                    <div className="relative group">
                        <select
                            {...register('project_id')}
                            className={cn(
                                "w-full px-6 py-4 bg-white/5 border rounded-2xl text-white outline-none transition-all appearance-none cursor-pointer font-bold",
                                errors.project_id ? "border-rose-500/30 bg-rose-500/5 text-rose-200" : "border-white/10 group-hover:border-white/20"
                            )}
                        >
                            <option value="" className="bg-gray-900">Choose node...</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id} className="bg-gray-900">{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            ↓
                        </div>
                    </div>
                    {errors.project_id && (
                        <p className="mt-2 text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">{errors.project_id.message}</p>
                    )}
                </div>

                {/* Bug Title */}
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                        Anomaly Signature (Title)
                    </label>
                    <input
                        {...register('title')}
                        placeholder="e.g. Protocol fracture in auth gate..."
                        className={cn(
                            "w-full px-6 py-4 bg-white/5 border rounded-2xl text-white outline-none transition-all font-bold placeholder:text-gray-700",
                            errors.title ? "border-rose-500/30 bg-rose-500/5 text-rose-200" : "border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
                        )}
                    />
                    {errors.title && (
                        <p className="mt-2 text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">{errors.title.message}</p>
                    )}
                </div>

                {/* Description & AI Block */}
                <div className="relative">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                        Diagnostic Data (Description)
                    </label>
                    <textarea
                        {...register('description')}
                        rows={6}
                        placeholder="Detailed log of the anomaly sequence..."
                        className={cn(
                            "w-full px-6 py-4 bg-white/5 border rounded-2xl text-white outline-none transition-all font-medium placeholder:text-gray-700 resize-none",
                            errors.description ? "border-rose-500/30 bg-rose-500/5 text-rose-200" : "border-white/10 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10"
                        )}
                    />
                    {errors.description && (
                        <p className="mt-2 text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">{errors.description.message}</p>
                    )}

                    {(isPredicting || prediction) && (
                        <div className="mt-6 p-8 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-white/10 rounded-[2.5rem] animate-in fade-in slide-in-from-top-4 duration-700 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all duration-1000" />

                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                                </div>
                                <div>
                                    <span className="text-xs font-black text-white uppercase tracking-[0.2em] block">Neural Insight active</span>
                                    <span className="text-[10px] font-bold text-gray-500">Synthetic Reasoning Layer v4.0</span>
                                </div>
                            </div>

                            {isPredicting ? (
                                <div className="flex items-center gap-4 text-indigo-400/80 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                                    <span className="text-sm font-black uppercase tracking-widest italic animate-pulse">Scanning patterns...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-indigo-400 mb-2">Category Vector</p>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-lg font-black text-white capitalize tracking-tighter">
                                                    {prediction?.category.replace('_', ' ')}
                                                </span>
                                                <ConfidenceBadge
                                                    score={prediction.confidence.category}
                                                    label="Prob"
                                                    onClick={() => setIsReasoningOpen(true)}
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-purple-400 mb-2">Severity Impact</p>
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-lg font-black text-white capitalize tracking-tighter">
                                                    {prediction?.severity}
                                                </span>
                                                <ConfidenceBadge
                                                    score={prediction.confidence.severity}
                                                    label="Prob"
                                                    onClick={() => setIsReasoningOpen(true)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setIsReasoningOpen(true)}
                                        className="bg-white/5 p-5 rounded-3xl border border-white/5 cursor-help hover:bg-white/10 transition-all group/reason"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-[9px] uppercase tracking-[0.3em] font-black text-gray-500">Core Logic Matrix</p>
                                            <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest opacity-0 group-hover/reason:opacity-100 transition-opacity flex items-center gap-1">
                                                Decode Details <Info className="w-3 h-3" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed font-medium line-clamp-2 italic">
                                            "{prediction.explanation}"
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={applyAISuggestion}
                                        className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-[0.98] flex items-center justify-center gap-3 mt-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Finalize Predictions
                                    </button>

                                    <ReasoningModal
                                        isOpen={isReasoningOpen}
                                        onClose={() => setIsReasoningOpen(false)}
                                        title="AI Logic Breakdown"
                                        explanation={prediction.explanation}
                                        confidence={{
                                            category: prediction.confidence.category,
                                            severity: prediction.confidence.severity
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Manual Selects */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                            Override Category
                        </label>
                        <select
                            {...register('category')}
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-gray-900">Choose...</option>
                            <option value="ui_ux" className="bg-gray-900">UI/UX</option>
                            <option value="functional" className="bg-gray-900">Functional</option>
                            <option value="performance" className="bg-gray-900">Performance</option>
                            <option value="security" className="bg-gray-900">Security</option>
                            <option value="data_logic" className="bg-gray-900">Data/Logic</option>
                            <option value="integration" className="bg-gray-900">Integration</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                            Override Severity
                        </label>
                        <select
                            {...register('severity')}
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none transition-all font-bold appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-gray-900">Choose...</option>
                            <option value="critical" className="bg-gray-900">Critical</option>
                            <option value="high" className="bg-gray-900">High</option>
                            <option value="medium" className="bg-gray-900">Medium</option>
                            <option value="low" className="bg-gray-900">Low</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-gray-100 transition-all disabled:opacity-20 disabled:cursor-not-allowed shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-4 group"
            >
                {isLoading ? (
                    <div className="w-10 h-1 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                    <>
                        {submitLabel}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                    </>
                )}
            </button>

            {/* Duplicates Section */}
            {duplicates.length > 0 && !initialData && (
                <div className="mt-12 space-y-8 pt-12 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                            <AlertTriangle className="w-6 h-6 text-amber-500 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-1">Collision Detected</h3>
                            <p className="text-[10px] font-bold text-gray-500">Neural footprints match existing reports. Review for redundancy.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {duplicates.map((dup) => (
                            <DuplicateBugCard
                                key={dup.id}
                                bug={dup}
                                onLink={(id) => {
                                    setDuplicateOf(id)
                                    applyAISuggestion()
                                }}
                            />
                        ))}
                    </div>

                    {duplicateOf && (
                        <div className="p-6 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-3xl flex items-center justify-between animate-in slide-in-from-bottom-4 backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-amber-500/20 rounded-xl">
                                    <Info className="w-4 h-4 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Link Protocol Prepared</p>
                                    <p className="text-[10px] font-medium text-gray-400">Anomaly status will be set to 'Redundant'</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDuplicateOf(null)}
                                className="text-[10px] font-black text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest border border-rose-500/20 px-4 py-2 rounded-xl bg-rose-500/5"
                            >
                                Abort Link
                            </button>
                        </div>
                    )}
                </div>
            )}
        </form>
    )
}
