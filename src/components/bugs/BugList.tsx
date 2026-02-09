'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BugCard } from './BugCard'
import { Loader2, Search, Filter, AlertCircle } from 'lucide-react'
import type { BugWithRelations, BugStatus, BugSeverity } from '@/types/database'

interface BugListProps {
    role: 'tester' | 'developer' | 'manager'
    projectId?: string
    userId?: string
    assignedTo?: string
    limit?: number
}

export function BugList({ role, projectId, userId, assignedTo, limit }: BugListProps) {
    const [bugs, setBugs] = useState<BugWithRelations[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filter, setFilter] = useState<BugStatus | 'all'>('all')
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [sortBy, setSortBy] = useState<'created_at' | 'severity' | 'status'>('created_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const supabase = createClient()

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    useEffect(() => {
        async function fetchBugs() {
            setLoading(true)
            try {
                let query = supabase
                    .from('bugs')
                    .select(`
            *,
            created_by_profile:profiles!bugs_created_by_fkey(*),
            project:projects(*)
          `)

                // Apply basic filters
                if (projectId) query = query.eq('project_id', projectId)
                if (userId) query = query.eq('created_by', userId)

                if (assignedTo) {
                    const { data: assignments } = await supabase
                        .from('bug_assignments')
                        .select('bug_id')
                        .eq('assigned_to', assignedTo)

                    if (assignments && assignments.length > 0) {
                        query = query.in('id', assignments.map(a => a.bug_id))
                    } else {
                        setBugs([])
                        setLoading(false)
                        return
                    }
                }

                if (filter !== 'all') query = query.eq('status', filter)

                // Apply Search (Server-side)
                if (debouncedSearch) {
                    query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`)
                }

                // Apply Sorting
                if (sortBy === 'severity') {
                    // Custom sorting for severity would normally need a join or a numeric mapping in DB
                    // For now, we'll just sort by created_at and do a simple desc/asc
                    query = query.order('created_at', { ascending: sortOrder === 'asc' })
                } else {
                    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
                }

                if (limit) query = query.limit(limit)

                const { data, error: fetchError } = await query

                if (fetchError) throw fetchError
                setBugs(data || [])
            } catch (err: any) {
                setError(err.message || 'Failed to fetch bugs')
            } finally {
                setLoading(false)
            }
        }

        fetchBugs()
    }, [projectId, userId, assignedTo, filter, limit, debouncedSearch, sortBy, sortOrder])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Loading bugs...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-12 bg-white border border-red-200 rounded-2xl flex flex-col items-center gap-4 text-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Error Loading Data</h3>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Filters & Search */}
            {!limit && (
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="relative w-full lg:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search bugs..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium text-gray-900"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-xl">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-2">Status</span>
                            <select
                                className="bg-transparent border-none px-2 py-1 text-xs font-bold text-gray-700 uppercase tracking-wider outline-none cursor-pointer"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value as any)}
                            >
                                <option value="all">Global</option>
                                <option value="open">Open</option>
                                <option value="in_progress">Active</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Finalized</option>
                                <option value="duplicate">Duplicate</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-xl">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-2">Sort</span>
                            <select
                                className="bg-transparent border-none px-2 py-1 text-xs font-bold text-gray-700 uppercase tracking-wider outline-none cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                            >
                                <option value="created_at">Date</option>
                                <option value="status">Status</option>
                                <option value="severity">Priority</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="p-1 px-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-700 active:scale-95"
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid */}
            {bugs.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <Bug className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-1">No Bugs Found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto">
                        {debouncedSearch || filter !== 'all'
                            ? "No results match your search criteria."
                            : "No bugs have been reported yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {bugs.map((bug) => (
                        <BugCard
                            key={bug.id}
                            bug={bug}
                            href={`/dashboard/${role}/bugs/${bug.id}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function Bug(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m8 2 1.88 1.88" />
            <path d="M14.12 3.88 16 2" />
            <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
            <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
            <path d="M12 20v-9" />
            <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
            <path d="M6 13H2" />
            <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
            <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
            <path d="M22 13h-4" />
            <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
        </svg>
    )
}
