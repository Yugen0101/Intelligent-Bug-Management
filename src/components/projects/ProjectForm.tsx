'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

const projectSchema = z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters').max(50),
    description: z.string().min(10, 'Description must be at least 10 characters').max(200),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
    onSubmit: (values: ProjectFormValues) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function ProjectForm({ onSubmit, onCancel, isLoading }: ProjectFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        Project Name
                    </label>
                    <input
                        {...register('name')}
                        type="text"
                        placeholder="e.g. NextGen AI Dashboard"
                        className={cn(
                            "w-full px-5 py-3.5 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium",
                            errors.name ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        )}
                    />
                    {errors.name && (
                        <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-600 rounded-full" />
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        Description
                    </label>
                    <textarea
                        {...register('description')}
                        rows={4}
                        placeholder="What is this project about? Keep it concise but descriptive."
                        className={cn(
                            "w-full px-5 py-3.5 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none font-medium resize-none",
                            errors.description ? "border-red-300 bg-red-50/30" : "border-gray-200"
                        )}
                    />
                    {errors.description && (
                        <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-600 rounded-full" />
                            {errors.description.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <FolderPlus className="w-5 h-5" />
                            Create Project
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
