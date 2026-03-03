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
    ArrowRight,
    User
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
    steps_to_reproduce: z.string().min(10, 'Please provide steps to reproduce'),
    expected_result: z.string().min(5, 'Please provide expected result'),
    actual_result: z.string().min(5, 'Please provide actual result'),
    project_id: z.string().uuid('Please select a project'),
    category: z.enum(['ui_ux', 'functional', 'performance', 'security', 'data_logic', 'integration']).optional(),
    severity: z.enum(['critical', 'high', 'medium', 'low']).optional(),
    assigned_to: z.string().uuid('Please select a team member').optional().or(z.literal('')),
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
    const [projectMembers, setProjectMembers] = useState<any[]>([])
    const [loadingMembers, setLoadingMembers] = useState(false)

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
            steps_to_reproduce: initialData?.steps_to_reproduce || '',
            expected_result: initialData?.expected_result || '',
            actual_result: initialData?.actual_result || '',
            project_id: initialData?.project_id || '',
            category: initialData?.category || undefined,
            severity: initialData?.severity || undefined,
            assigned_to: '',
        }
    })

    const title = watch('title')
    const description = watch('description')
    const steps = watch('steps_to_reproduce')
    const expected = watch('expected_result')
    const actual = watch('actual_result')
    const projectId = watch('project_id')

    useEffect(() => {
        async function fetchProjects() {
            const { data } = await supabase.from('projects').select('*').order('name')
            if (data) setProjects(data)
        }
        fetchProjects()
    }, [])

    useEffect(() => {
        async function fetchProjectMembers() {
            if (!projectId) {
                setProjectMembers([])
                return
            }
            setLoadingMembers(true)
            try {
                const { data, error } = await supabase
                    .from('project_members')
                    .select('user_id, profiles!inner(id, full_name, role)')
                    .eq('project_id', projectId)

                if (error) throw error
                setProjectMembers(data?.map(m => (m as any).profiles) || [])
            } catch (err) {
                console.error('Error fetching project members:', err)
            } finally {
                setLoadingMembers(false)
            }
        }
        fetchProjectMembers()
    }, [projectId])

    useEffect(() => {
        const analyzeText = async () => {
            const hasEnoughContent = (title?.length > 10) &&
                (description?.length > 20 || steps?.length > 20);

            if (hasEnoughContent && !isPredicting && !initialData) {
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
                        body: JSON.stringify({
                            title,
                            description,
                            steps_to_reproduce: steps,
                            expected_result: expected,
                            actual_result: actual
                        })
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
    }, [title, description, steps, expected, actual, projectId, initialData])

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
                        Select Project
                    </label>
                    <div className="relative group">
                        <select
                            {...register('project_id')}
                            className={cn(
                                "w-full px-4 py-3 bg-white border rounded-xl text-gray-900 outline-none transition-all appearance-none cursor-pointer font-medium",
                                errors.project_id ? "border-red-300 bg-red-50 text-red-900" : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                            )}
                        >
                            <option value="">Select project...</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            ↓
                        </div>
                    </div>
                    {errors.project_id && (
                        <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wider ml-1">{errors.project_id.message}</p>
                    )}
                </div>

                {/* Assignment Dropdown */}
                <div className="pt-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                        Assign To
                    </label>
                    <div className="relative group">
                        <select
                            {...register('assigned_to')}
                            disabled={!projectId || loadingMembers}
                            className={cn(
                                "w-full px-4 py-3 bg-white border rounded-xl text-gray-900 outline-none transition-all appearance-none cursor-pointer font-medium disabled:opacity-50 disabled:bg-gray-50",
                                errors.assigned_to ? "border-red-300 bg-red-50 text-red-900" : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                            )}
                        >
                            <option value="">{loadingMembers ? 'Loading members...' : projectId ? 'Select member...' : 'Select a project first'}</option>
                            {projectMembers.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.full_name} ({member.role})
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="text-xs">↓</span>
                        </div>
                    </div>
                    {errors.assigned_to && (
                        <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wider ml-1">{errors.assigned_to.message}</p>
                    )}
                </div>

                {/* Bug Title */}
                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                        Bug Title
                    </label>
                    <input
                        {...register('title')}
                        placeholder="e.g. Navigation bar is broken..."
                        className={cn(
                            "w-full px-4 py-3 bg-white border rounded-xl text-gray-900 outline-none transition-all font-medium placeholder:text-gray-400",
                            errors.title ? "border-red-300 bg-red-50 text-red-900" : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        )}
                    />
                    {errors.title && (
                        <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wider ml-1">{errors.title.message}</p>
                    )}
                </div>

                {/* Description & AI Block */}
                <div className="relative">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                        Bug Description
                    </label>
                    <textarea
                        {...register('description')}
                        rows={6}
                        placeholder="Describe the issue in detail..."
                        className={cn(
                            "w-full px-4 py-3 bg-white border rounded-xl text-gray-900 outline-none transition-all font-medium placeholder:text-gray-400 resize-none",
                            errors.description ? "border-red-300 bg-red-50 text-red-900" : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        )}
                    />
                    {errors.description && (
                        <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wider ml-1">{errors.description.message}</p>
                    )}
                </div>

                {/* Steps, Expected, Actual */}
                <div className="grid grid-cols-1 gap-10">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                            Steps to Reproduce
                        </label>
                        <textarea
                            {...register('steps_to_reproduce')}
                            rows={4}
                            placeholder="1. Open app\n2. Click login\n3. Observe..."
                            className={cn(
                                "w-full px-4 py-3 bg-white border rounded-xl text-gray-900 outline-none transition-all font-medium placeholder:text-gray-400 resize-none",
                                errors.steps_to_reproduce ? "border-red-300 bg-red-50 text-red-900" : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                            )}
                        />
                        {errors.steps_to_reproduce && (
                            <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wider ml-1">{errors.steps_to_reproduce.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                                Expected Result
                            </label>
                            <textarea
                                {...register('expected_result')}
                                rows={3}
                                placeholder="What should happen?"
                                className={cn(
                                    "w-full px-4 py-3 bg-white border rounded-xl text-gray-900 outline-none transition-all font-medium placeholder:text-gray-400 resize-none",
                                    errors.expected_result ? "border-red-300 bg-red-50 text-red-900" : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                )}
                            />
                            {errors.expected_result && (
                                <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wider ml-1">{errors.expected_result.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                                Actual Result
                            </label>
                            <textarea
                                {...register('actual_result')}
                                rows={3}
                                placeholder="What actually happened?"
                                className={cn(
                                    "w-full px-4 py-3 bg-white border rounded-xl text-gray-900 outline-none transition-all font-medium placeholder:text-gray-400 resize-none",
                                    errors.actual_result ? "border-red-300 bg-red-50 text-red-900" : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10"
                                )}
                            />
                            {errors.actual_result && (
                                <p className="mt-1 text-xs font-bold text-red-500 uppercase tracking-wider ml-1">{errors.actual_result.message}</p>
                            )}
                        </div>
                    </div>

                    {(isPredicting || prediction) && (
                        <div className="mt-6 p-6 bg-primary/5/50 border border-blue-100 rounded-2xl relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider block">AI Analysis</span>
                                    <span className="text-[10px] text-gray-500">Intelligent Prediction Layer</span>
                                </div>
                            </div>

                            {isPredicting ? (
                                <div className="flex items-center gap-3 text-primary p-3 bg-white border border-blue-100 rounded-xl">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm font-bold uppercase tracking-wider">Analyzing...</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-blue-100">
                                            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-500 mb-1">Predicted Category</p>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-lg font-bold text-gray-900 capitalize tracking-tight">
                                                    {prediction?.category.replace('_', ' ')}
                                                </span>
                                                <ConfidenceBadge
                                                    score={prediction.confidence.category}
                                                    label="Prob"
                                                    onClick={() => setIsReasoningOpen(true)}
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-purple-100">
                                            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-500 mb-1">Predicted Severity</p>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-lg font-bold text-gray-900 capitalize tracking-tight">
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
                                        className="bg-white p-4 rounded-xl border border-gray-100 cursor-help hover:border-gray-200 transition-all group/reason"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[9px] uppercase tracking-wider font-bold text-gray-400">AI Explanation</p>
                                            <div className="text-[8px] font-bold text-primary uppercase tracking-wider opacity-0 group-hover/reason:opacity-100 transition-opacity">
                                                Details
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                                            {prediction.explanation}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={applyAISuggestion}
                                        className="w-full py-3.5 bg-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 mt-2"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        Apply AI Suggestions
                                    </button>

                                    <ReasoningModal
                                        isOpen={isReasoningOpen}
                                        onClose={() => setIsReasoningOpen(false)}
                                        title="AI Analysis Details"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                            Override Category
                        </label>
                        <select
                            {...register('category')}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none transition-all font-medium appearance-none cursor-pointer"
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
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4 ml-1">
                            Override Severity
                        </label>
                        <select
                            {...register('severity')}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 outline-none transition-all font-medium appearance-none cursor-pointer"
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
                className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md active:scale-95 flex items-center justify-center gap-3 group"
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
                <div className="mt-8 space-y-6 pt-8 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-0.5">Potential Duplicates</h3>
                            <p className="text-[10px] text-gray-500">Existing reports found with similar descriptions.</p>
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
                        <div className="p-4 bg-amber-50 border border-dashed border-amber-200 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Info className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-0.5">Linking to Existing Bug</p>
                                    <p className="text-[10px] text-gray-500">This report will be marked as a duplicate.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDuplicateOf(null)}
                                className="text-[10px] font-bold text-red-600 hover:text-red-700 transition-colors uppercase tracking-wider border border-red-200 px-3 py-1.5 rounded-lg bg-white"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            )}
        </form>
    )
}
