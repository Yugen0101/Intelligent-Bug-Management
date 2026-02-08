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
    const severityColors = {
        critical: 'bg-red-100 text-red-700 border-red-200',
        high: 'bg-orange-100 text-orange-700 border-orange-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        low: 'bg-green-100 text-green-700 border-green-200',
    }

    const statusColors = {
        open: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-purple-100 text-purple-700',
        resolved: 'bg-emerald-100 text-emerald-700',
        closed: 'bg-gray-100 text-gray-700',
        duplicate: 'bg-gray-400 text-white',
    }

    return (
        <Link href={href}>
            <Card className="hover:shadow-md transition-all duration-200 border-gray-100 overflow-hidden group">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={cn("font-bold uppercase text-[10px] tracking-wider", severityColors[bug.severity || 'low'])}>
                                    {bug.severity}
                                </Badge>
                                <Badge variant="secondary" className={cn("font-medium text-[10px]", statusColors[bug.status || 'open'])}>
                                    {bug.status?.replace('_', ' ')}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {bug.title}
                            </CardTitle>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                            #{bug.id.slice(0, 8)}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                        {bug.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                            <Tag className="w-3.5 h-3.5" />
                            <span className="capitalize">{bug.category?.replace('_', '/')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}</span>
                        </div>
                        {bug.created_by_profile && (
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                                <User className="w-3.5 h-3.5" />
                                <span>{bug.created_by_profile.full_name}</span>
                            </div>
                        )}
                        {bug.ai_metadata?.category_prediction && (
                            <div className="ml-auto flex items-center gap-1.5">
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold border border-purple-100">
                                    <AlertCircle className="w-3 h-3" />
                                    AI Suggested
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
