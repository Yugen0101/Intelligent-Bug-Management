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
        critical: 'bg-rose-50 text-rose-700 border-rose-200',
        high: 'bg-orange-50 text-orange-700 border-orange-200',
        medium: 'bg-amber-50 text-amber-700 border-amber-200',
        low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }

    const statusStyles = {
        open: 'bg-blue-50 text-blue-700 border-blue-200',
        in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
        resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        closed: 'bg-gray-100 text-gray-700 border-gray-200',
        duplicate: 'bg-slate-100 text-slate-700 border-slate-200',
    }

    return (
        <Link href={href} className="group overflow-visible">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-gray-300 relative h-full flex flex-col">


                <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                severityStyles[bug.severity || 'low']
                            )}>
                                {bug.severity}
                            </span>
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                statusStyles[bug.status || 'open']
                            )}>
                                {bug.status?.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        ID: {bug.id.slice(0, 8)}
                    </span>
                </div>

                <div className="flex-1 relative z-10">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1 tracking-tight">
                        {bug.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {bug.description}
                    </p>
                </div>

                <div className="mt-auto relative z-10">
                    <div className="flex flex-wrap items-center gap-y-3 gap-x-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <Tag className="w-3 h-3 text-blue-500" />
                            <span>{bug.category?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                            <Clock className="w-3 h-3 text-blue-500" />
                            <span>{formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}</span>
                        </div>
                        {bug.created_by_profile && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                <User className="w-3 h-3 text-blue-500" />
                                <span>{bug.created_by_profile.full_name}</span>
                            </div>
                        )}
                    </div>

                    {bug.ai_metadata?.category_prediction && (
                        <div className="mt-4 flex">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-blue-100">
                                <AlertCircle className="w-3 h-3" />
                                AI Suggested
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
