'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Users, Mail, UserPlus, Shield, MoreVertical } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Profile {
    id: string
    full_name: string
    role: string
    avatar_url: string | null
}

export default function TeamPage() {
    const [members, setMembers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchTeam() {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name')

            if (data) setMembers(data)
            setLoading(false)
        }
        fetchTeam()
    }, [])

    return (
        <DashboardLayout role="manager">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Team Management</h1>
                        <p className="text-gray-500 font-medium">Manage cross-functional teams and role assignments.</p>
                    </div>
                    <button className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98]">
                        <UserPlus className="w-5 h-5" />
                        Invite Member
                    </button>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-50 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {members.map((member) => (
                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                                {member.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{member.full_name}</div>
                                                <div className="text-xs text-gray-400">member@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${member.role === 'manager' ? 'bg-purple-50 text-purple-600' :
                                                member.role === 'developer' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-emerald-50 text-emerald-600'
                                            }`}>
                                            {member.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-xs font-bold text-gray-500 uppercase">Active</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-gray-600 group-hover:bg-white rounded-lg transition-all">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}
