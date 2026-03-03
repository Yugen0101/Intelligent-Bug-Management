'use client'

import { useState, useEffect } from 'react'
import { Zap, AlertCircle, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface PriorityRecommendation {
    bug_id: string;
    score: number;
    reasoning: string;
    suggested_action: string;
    title?: string;
    severity?: string;
}

export function SmartPriorityQueue({ projectId }: { projectId?: string }) {
    const [recommendations, setRecommendations] = useState<PriorityRecommendation[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!projectId) return

        async function fetchPriority() {
            setIsLoading(true)
            try {
                const response = await fetch(`/api/ai/priority?project_id=${projectId}`)
                if (response.ok) {
                    const data = await response.json()
                    setRecommendations(data.slice(0, 3)) // Top 3
                }
            } catch (err) {
                console.error('Priority Fetch Error:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPriority()
    }, [projectId])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 italic text-gray-400 text-sm">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                BugMind is prioritizing...
            </div>
        )
    }

    if (recommendations.length === 0) return null

    return (
        <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Zap className="w-24 h-24 text-primary" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Fix This First
                <span className="ml-2 px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                    AI Suggested
                </span>
            </h3>

            <div className="space-y-4">
                {recommendations.map((rec, idx) => (
                    <div
                        key={rec.bug_id}
                        className={cn(
                            "group/item p-5 rounded-xl border transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
                            idx === 0 ? "bg-primary/5/30 border-blue-100" : "bg-gray-50/50 border-gray-100 hover:border-blue-100"
                        )}
                    >
                        <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm",
                                    idx === 0 ? "bg-primary text-white shadow-lg shadow-blue-200" : "bg-gray-200 text-gray-600"
                                )}>
                                    {rec.score}
                                </div>
                                <h4 className="font-bold text-gray-900 line-clamp-1 group-hover/item:text-blue-700 transition-colors">
                                    {rec.title || `Bug #${rec.bug_id.slice(0, 8)}`}
                                </h4>
                            </div>
                            <Link
                                href={`/dashboard/manager/bugs/${rec.bug_id}`}
                                className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-primary hover:border-blue-200 transition-all shadow-sm"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <p className="text-xs text-gray-600 font-medium leading-relaxed mb-4">
                            {rec.reasoning}
                        </p>

                        <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                Action: <span className="text-gray-900">{rec.suggested_action}</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
