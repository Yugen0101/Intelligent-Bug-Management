'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Users, Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProfiles } from '@/hooks/useProfiles'
import { UserRole } from '@/types/database'

interface TeamAssignmentModalProps {
    isOpen: boolean
    onClose: () => void
    projectId: string
    projectName: string
}

export function TeamAssignmentModal({ isOpen, onClose, projectId, projectName }: TeamAssignmentModalProps) {
    const roles = useMemo<UserRole[]>(() => ['developer', 'tester'], [])
    const { profiles, loading: loadingProfiles } = useProfiles(roles)
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        async function fetchCurrentMembers() {
            if (!projectId || !isOpen) return
            const { data } = await supabase
                .from('project_members')
                .select('user_id')
                .eq('project_id', projectId)

            if (data) {
                setSelectedMembers(data.map(m => m.user_id))
            }
        }
        fetchCurrentMembers()
    }, [projectId, isOpen, supabase])

    const toggleMember = (id: string) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // 1. Delete all existing members for this project
            await supabase
                .from('project_members')
                .delete()
                .eq('project_id', projectId)

            // 2. Insert new members
            if (selectedMembers.length > 0) {
                const { data: selectedProfiles } = await supabase
                    .from('profiles')
                    .select('id, role')
                    .in('id', selectedMembers)

                const inserts = selectedProfiles?.map(p => ({
                    project_id: projectId,
                    user_id: p.id,
                    role: p.role
                })) || []

                if (inserts.length > 0) {
                    const { error } = await supabase.from('project_members').insert(inserts)
                    if (error) throw error
                }
            }
            onClose()
        } catch (error: any) {
            console.error('Error updating team:', error.message)
            alert('Failed to update team: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    const filteredProfiles = profiles.filter(p =>
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Manage Team</h2>
                        <p className="text-gray-500 text-sm font-medium">{projectName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-100">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white transition-all outline-none text-sm font-bold"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                        {loadingProfiles ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />
                            ))
                        ) : filteredProfiles.length > 0 ? (
                            filteredProfiles.map((profile) => (
                                <div
                                    key={profile.id}
                                    onClick={() => toggleMember(profile.id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                        selectedMembers.includes(profile.id)
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-gray-100 bg-white hover:border-gray-300"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm">
                                            {profile.full_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-none mb-1">{profile.full_name}</p>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{profile.role}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
                                        selectedMembers.includes(profile.id)
                                            ? "bg-primary border-primary text-white"
                                            : "border-gray-200 group-hover:border-gray-400"
                                    )}>
                                        {selectedMembers.includes(profile.id) && <Check className="w-4 h-4" />}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-xs font-bold text-gray-400 uppercase">No members found</p>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="flex-1 px-6 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Update Team
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
