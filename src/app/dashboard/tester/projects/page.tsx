'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FolderKanban, Plus, ExternalLink, Bug } from 'lucide-react'
import Link from 'next/link'

interface Project {
    id: string
    name: string
    description: string
    created_at: string
}

export default function TesterProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchProjects() {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false })

            if (data) setProjects(data)
            setLoading(false)
        }
        fetchProjects()
    }, [])

    return (
        <DashboardLayout role="tester">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Projects</h1>
                        <p className="text-gray-500 font-medium">Browse projects and view associated bug reports.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-gray-50 rounded-3xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div key={project.id} className="group p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 transition-all hover:scale-[1.02] hover:shadow-2xl duration-300">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <FolderKanban className="w-6 h-6" />
                                    </div>
                                    <Link
                                        href={`/dashboard/tester/bugs?project=${project.id}`}
                                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                    </Link>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                                    {project.description || 'No description provided.'}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                    <Link
                                        href="/dashboard/tester/bugs/new"
                                        className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <Bug className="w-4 h-4" />
                                        Report Bug
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">No projects found</h3>
                        <p className="text-gray-500">Projects will appear here once they are created by a manager.</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
