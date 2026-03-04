'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, FolderPlus, Users, Check, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfiles } from '@/hooks/useProfiles'
import { UserRole } from '@/types/database'

const projectSchema = z.object({
    name: z.string().min(3, 'Project name must be at least 3 characters').max(50),
    description: z.string().min(10, 'Description must be at least 10 characters').max(200),
    team_members: z.array(z.string()).min(1, 'Please select at least one team member'),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
    onSubmit: (values: ProjectFormValues) => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function ProjectForm({ onSubmit, onCancel, isLoading }: ProjectFormProps) {
    const roles = useMemo<UserRole[]>(() => ['developer', 'tester'], [])
    const { profiles, loading: loadingProfiles } = useProfiles(roles)
    const [searchTerm, setSearchTerm] = useState('')

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            team_members: []
        }
    })

    const selectedMembers = watch('team_members')

    const toggleMember = (id: string) => {
        const current = [...selectedMembers]
        const index = current.indexOf(id)
        if (index > -1) {
            current.splice(index, 1)
        } else {
            current.push(id)
        }
        setValue('team_members', current, { shouldValidate: true })
    }

    const filteredProfiles = profiles.filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

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
                            "w-full px-5 py-3.5 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium",
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
                        rows={3}
                        placeholder="What is this project about? Keep it concise but descriptive."
                        className={cn(
                            "w-full px-5 py-3.5 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium resize-none",
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

                {/* Team Assignment */}
                <div className="pt-2">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Assign Team Members
                        </label>
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase">
                            {selectedMembers.length} Selected
                        </span>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                        {loadingProfiles ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                            ))
                        ) : filteredProfiles.length > 0 ? (
                            filteredProfiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    onClick={() => toggleMember(profile.id)}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group",
                                        selectedMembers.includes(profile.id)
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-gray-100 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold text-sm border-2 border-white shadow-sm">
                                            {profile.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{profile.full_name}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{profile.role}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-5 h-5 rounded-lg border flex items-center justify-center transition-all",
                                        selectedMembers.includes(profile.id)
                                            ? "bg-primary border-primary text-white"
                                            : "border-gray-200 group-hover:border-gray-400"
                                    )}>
                                        {selectedMembers.includes(profile.id) && <Check className="w-3.5 h-3.5" />}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-6 text-xs font-bold text-gray-400 uppercase">No members found</p>
                        )}
                    </div>
                    {errors.team_members && (
                        <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-600 rounded-full" />
                            {errors.team_members.message}
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
                    className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
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
