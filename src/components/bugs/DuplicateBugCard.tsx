import { useState } from 'react'
import {
    AlertTriangle,
    ExternalLink,
    Link as LinkIcon,
    AlertCircle,
    Copy,
    Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DuplicateResult } from '@/lib/ai/duplicates'
import { ConfidenceBadge, ReasoningModal } from '@/components/ui/AIExplainability'

interface DuplicateBugCardProps {
    bug: DuplicateResult
    onLink: (id: string) => void
}

export function DuplicateBugCard({ bug, onLink }: DuplicateBugCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const similarityPercent = (bug.similarity * 100).toFixed(0);

    return (
        <div className="bg-white border-2 border-amber-100 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all group animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-50 rounded-xl">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1">{bug.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <ConfidenceBadge
                                label="Similarity"
                                score={bug.similarity}
                                onClick={() => setIsModalOpen(true)}
                            />
                        </div>
                    </div>
                </div>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 capitalize text-[10px] whitespace-nowrap">
                    {bug.status}
                </Badge>
            </div>

            <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed font-medium">
                {bug.description}
            </p>

            {bug.reasoning && (
                <div className="mb-4 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                    <p className="text-[10px] font-bold text-amber-900 leading-tight">
                        <span className="opacity-50 mr-1">AI LOGIC:</span>
                        {bug.reasoning}
                    </p>
                </div>
            )}

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onLink(bug.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-200"
                >
                    <LinkIcon className="w-3 h-3" />
                    Mark as Duplicate
                </button>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2 bg-white text-amber-600 rounded-xl hover:bg-amber-50 transition-all border border-amber-100"
                    title="AI Reasoning"
                >
                    <Info className="w-3.5 h-3.5" />
                </button>
                <a
                    href={`/dashboard/tester/bugs/${bug.id}`}
                    target="_blank"
                    className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                    title="View Original Bug"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>

            <ReasoningModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Duplicate Match Analysis"
                explanation={bug.reasoning || "Based on vector embeddings, this bug report shares a high semantic similarity with an existing entry, indicating a redundant functional report."}
                confidence={{ overall: bug.similarity }}
            />
        </div>
    )
}
