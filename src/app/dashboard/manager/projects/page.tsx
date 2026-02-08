'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { FolderKanban, Plus, ExternalLink, Users, BarChart, X } from 'lucide-react'
import Link from 'next/link'
import { ProjectForm, ProjectFormValues } from '@/components/projects/ProjectForm'

interface Project {
    id: string
    name: string
    description: string
    created_at: string
}

export default function ManagerProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    const fetchProjects = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setProjects(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    const handleCreateProject = async (values: ProjectFormValues) => {
        setIsSubmitting(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const { error } = await supabase
                .from('projects')
                .insert({
                    name: values.name,
                    description: values.description,
                    created_by: user.id
                })

            if (error) throw error

            await fetchProjects()
            setShowForm(false)
        } catch (error: any) {
            console.error('Error creating project:', error.message)
            alert('Failed to create project: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout role="manager">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Project Management</h1>
                        <p className="text-gray-500 font-medium font-inter">Oversee all software projects and team assignments.</p>
                    </div>
                    {!showForm && (
                        <button
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
                            onClick={() => setShowForm(true)}
                        >
                            <Plus className="w-5 h-5" />
                            Create New Project
                        </button>
                    )}
                </div>

                {showForm ? (
                    <div className="max-w-2xl bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-100/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-gray-900">Add New Project</h2>
                                <p className="text-gray-400 font-medium text-sm">Fill in the details below to launch a new workspace.</p>
                            </div>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-3 hover:bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all border border-transparent hover:border-gray-100"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <ProjectForm
                            onSubmit={handleCreateProject}
                            onCancel={() => setShowForm(false)}
                            isLoading={isSubmitting}
                        />
                    </div>
                ) : (
                    <>
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
                                                href={`/dashboard/manager/bugs?project=${project.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </Link>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                                            {project.description || 'No description provided.'}
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                            <Link
                                                href={`/dashboard/manager/team?project=${project.id}`}
                                                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600"
                                            >
                                                <Users className="w-4 h-4" />
                                                Team
                                            </Link>
                                            <Link
                                                href={`/dashboard/manager/insights?project=${project.id}`}
                                                className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600"
                                            >
                                                <BarChart className="w-4 h-4" />
                                                Analytics
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <FolderKanban className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">No projects yet</h3>
                                <p className="text-gray-500">Create your first project to start tracking bugs.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}
