'use client'

import { useState } from 'react'
import {
    Info,
    ChevronRight,
    Target,
    Zap,
    ShieldCheck,
    AlertCircle,
    X,
    Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

interface ConfidenceBadgeProps {
    score: number
    label: string
    onClick?: () => void
}

export function ConfidenceBadge({ score, label, onClick }: ConfidenceBadgeProps) {
    const percent = Math.round(score * 100)

    const getColor = (s: number) => {
        if (s >= 0.8) return 'text-emerald-600 bg-emerald-50 border-emerald-100'
        if (s >= 0.5) return 'text-amber-600 bg-amber-50 border-amber-100'
        return 'text-rose-600 bg-rose-50 border-rose-100'
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                getColor(score)
            )}
        >
            <Target className="w-3 h-3" />
            {label}: {percent}%
            <Info className="w-3 h-3 opacity-50" />
        </button>
    )
}

interface ReasoningModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    explanation: string
    confidence: {
        category?: number
        severity?: number
        overall?: number
    }
}

export function ReasoningModal({ isOpen, onClose, title, explanation, confidence }: ReasoningModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white relative">
                    <Sparkles className="absolute top-6 right-8 w-12 h-12 opacity-20" />
                    <DialogTitle className="text-2xl font-black mb-2">AI Reasoning</DialogTitle>
                    <DialogDescription className="text-indigo-100 font-medium">
                        Deep dive into how our models analyzed this bug.
                    </DialogDescription>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Zap className="w-3 h-3 text-amber-500" />
                            Contextual Logic
                        </h4>
                        <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                            "{explanation}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {confidence.category !== undefined && (
                            <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Classifier Conf.</div>
                                <div className="text-xl font-black text-indigo-600">{(confidence.category * 100).toFixed(0)}%</div>
                            </div>
                        )}
                        {confidence.severity !== undefined && (
                            <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm">
                                <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Impact Analysis</div>
                                <div className="text-xl font-black text-purple-600">{(confidence.severity * 100).toFixed(0)}%</div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <p className="text-[10px] font-bold leading-tight">
                                Our models cross-reference historical bug patterns and vector embeddings to ensure maximum accuracy.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black transition-all"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
