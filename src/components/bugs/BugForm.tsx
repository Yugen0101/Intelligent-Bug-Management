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
    Info
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Project
                    </label>
                    <select
                        {...register('project_id')}
                        className={cn(
                            "w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none",
                            errors.project_id ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        )}
                    >
                        <option value="">Select a project</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    {errors.project_id && (
                        <p className="mt-1.5 text-xs font-medium text-red-600 ml-1">{errors.project_id.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Bug Title
                    </label>
                    <input
                        {...register('title')}
                        placeholder="e.g. Login button unresponsive on mobile"
                        className={cn(
                            "w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none",
                            errors.title ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        )}
                    />
                    {errors.title && (
                        <p className="mt-1.5 text-xs font-medium text-red-600 ml-1">{errors.title.message}</p>
                    )}
                </div>

                <div className="relative">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Description
                    </label>
                    <textarea
                        {...register('description')}
                        rows={6}
                        placeholder="Describe what happened, steps to reproduce, and expected vs actual behavior..."
                        className={cn(
                            "w-full px-4 py-3 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none resize-none",
                            errors.description ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        )}
                    />
                    {errors.description && (
                        <p className="mt-1.5 text-xs font-medium text-red-600 ml-1">{errors.description.message}</p>
                    )}

                    {(isPredicting || prediction) && (
                        <div className="mt-4 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Sparkles className="w-12 h-12 text-indigo-600" />
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                                <span className="text-sm font-black text-indigo-900 uppercase tracking-widest">AI Intelligence</span>
                                {prediction && (
                                    <Badge variant="outline" className="ml-auto bg-white/50 text-indigo-700 border-indigo-200">
                                        ML v4.0 Active
                                    </Badge>
                                )}
                            </div>

                            {isPredicting ? (
                                <div className="flex items-center gap-3 text-indigo-600/70 p-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span className="text-sm font-bold italic tracking-wide">Classifying bug pattern...</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-4">
                                        <div className="bg-white/60 p-3 rounded-2xl border border-white/50 backdrop-blur-sm flex-1 min-w-[140px]">
                                            <p className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-400 mb-1.5 flex justify-between">
                                                Category
                                            </p>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-black text-indigo-900 capitalize block truncate">
                                                    {prediction?.category.replace('_', '/')}
                                                </span>
                                                <ConfidenceBadge
                                                    score={prediction.confidence.category}
                                                    label="Conf"
                                                    onClick={() => setIsReasoningOpen(true)}
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white/60 p-3 rounded-2xl border border-white/50 backdrop-blur-sm flex-1 min-w-[140px]">
                                            <p className="text-[10px] uppercase tracking-wider font-extrabold text-purple-400 mb-1.5 flex justify-between">
                                                Severity
                                            </p>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-sm font-black text-purple-900 capitalize block truncate">
                                                    {prediction?.severity}
                                                </span>
                                                <ConfidenceBadge
                                                    score={prediction.confidence.severity}
                                                    label="Conf"
                                                    onClick={() => setIsReasoningOpen(true)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        onClick={() => setIsReasoningOpen(true)}
                                        className="bg-indigo-600/5 p-3 rounded-2xl border border-indigo-600/10 cursor-help hover:bg-indigo-600/10 transition-colors"
                                    >
                                        <p className="text-[10px] uppercase tracking-wider font-black text-indigo-500 mb-1 flex justify-between items-center">
                                            AI Reasoning
                                            <span className="text-[8px] opacity-50 font-medium">Click for details</span>
                                        </p>
                                        <p className="text-xs text-indigo-900/80 leading-relaxed font-medium line-clamp-2">
                                            {prediction.explanation}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={applyAISuggestion}
                                        className="w-full py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 mt-2"
                                    >
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Apply AI Suggestion
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

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide opacity-60">
                            Manual Category
                        </label>
                        <select
                            {...register('category')}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                        >
                            <option value="">Choose...</option>
                            <option value="ui_ux">UI/UX</option>
                            <option value="functional">Functional</option>
                            <option value="performance">Performance</option>
                            <option value="security">Security</option>
                            <option value="data_logic">Data/Logic</option>
                            <option value="integration">Integration</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide opacity-60">
                            Manual Severity
                        </label>
                        <select
                            {...register('severity')}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-bold"
                        >
                            <option value="">Choose...</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isLoading ? 'Wait a moment...' : submitLabel}
            </button>

            {duplicates.length > 0 && !initialData && (
                <div className="mt-8 space-y-6 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 shadow-sm rounded-xl bg-amber-50">
                            <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Similar Bugs Detected</h3>
                            <p className="text-[10px] font-bold text-gray-500 italic">We found existing reports that look similar to yours. Please review them.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
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
                        <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-600 rounded-xl">
                                    <Info className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Duplicate Link Prepared</p>
                                    <p className="text-[10px] font-medium text-amber-700">This bug will be linked and status set to 'Duplicate'</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDuplicateOf(null)}
                                className="text-[10px] font-bold text-amber-600 hover:text-amber-800 underline uppercase tracking-tighter"
                            >
                                Cancel Link
                            </button>
                        </div>
                    )}
                </div>
            )}
        </form>
    )
}
