'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BugWithRelations } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, Clock, Tag, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BugCardProps {
    bug: BugWithRelations
    href: string
}

export function BugCard({ bug, href }: BugCardProps) {
    const severityStyles = {
        critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
        high: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
        medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
        low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    }

    const statusStyles = {
        open: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        closed: 'bg-gray-500/10 text-gray-400 border-white/5',
        duplicate: 'bg-gray-800 text-gray-400 border-white/5',
    }

    return (
        <Link href={href} className="group overflow-visible">
            <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/20 relative overflow-hidden h-full flex flex-col">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />

                <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border",
                                severityStyles[bug.severity || 'low']
                            )}>
                                {bug.severity}
                            </span>
                            <span className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border",
                                statusStyles[bug.status || 'open']
                            )}>
                                {bug.status?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest whitespace-nowrap bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                        ID: {bug.id.slice(0, 8)}
                    </span>
                </div>

                <div className="flex-1 relative z-10">
                    <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors mb-4 line-clamp-1 tracking-tighter">
                        {bug.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-8 leading-relaxed font-medium">
                        {bug.description}
                    </p>
                </div>

                <div className="mt-auto relative z-10">
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-6 pt-6 border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <Tag className="w-3 h-3 text-indigo-500" />
                            <span>{bug.category?.replace('_', '/')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            <Clock className="w-3 h-3 text-indigo-500" />
                            <span>{formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}</span>
                        </div>
                        {bug.created_by_profile && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                <User className="w-3 h-3 text-indigo-500" />
                                <span>{bug.created_by_profile.full_name}</span>
                            </div>
                        )}
                    </div>

                    {bug.ai_metadata?.category_prediction && (
                        <div className="mt-4 flex animate-pulse">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-500/20">
                                <AlertCircle className="w-3 h-3" />
                                Neural Classification
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
