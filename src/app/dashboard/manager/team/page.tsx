'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Users, Mail, UserPlus, Shield, MoreVertical } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PremiumSelect } from '@/components/ui/PremiumSelect'

interface Profile {
    id: string
    full_name: string
    role: string
    avatar_url: string | null
}

export default function TeamPage() {
    const [members, setMembers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [isInviting, setIsInviting] = useState(false)
    const [inviteData, setInviteData] = useState({ name: '', email: '', role: 'developer' })
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

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsInviting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        const newMember: Profile = {
            id: Math.random().toString(36).substr(2, 9),
            full_name: inviteData.name,
            role: inviteData.role,
            avatar_url: null
        }

        setMembers(prev => [newMember, ...prev])
        setIsInviting(false)
        setIsInviteModalOpen(false)
        setInviteData({ name: '', email: '', role: 'developer' })
    }

    return (
        <DashboardLayout role="manager">
            {/* Invite Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Invite Member</h2>
                            <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <MoreVertical className="w-5 h-5 text-gray-400 rotate-45" /> {/* Using MoreVertical as a placeholder or close icon */}
                            </button>
                        </div>

                        <form onSubmit={handleInvite} className="space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="John Doe"
                                    value={inviteData.name}
                                    onChange={e => setInviteData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="john@example.com"
                                    value={inviteData.email}
                                    onChange={e => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-sm font-bold"
                                />
                            </div>
                            <PremiumSelect
                                label="Role"
                                placeholder="Select role..."
                                options={[
                                    { value: 'tester', label: 'Tester', icon: <Shield className="w-3.5 h-3.5" /> },
                                    { value: 'developer', label: 'Developer', icon: <Shield className="w-3.5 h-3.5" /> },
                                    { value: 'manager', label: 'Manager', icon: <Shield className="w-3.5 h-3.5" /> },
                                ]}
                                value={inviteData.role}
                                onChange={(val) => setInviteData(prev => ({ ...prev, role: val }))}
                                showNone
                                noneLabel="No Role (None)"
                            />

                            <button
                                type="submit"
                                disabled={isInviting}
                                className="w-full mt-4 py-4 bg-blue-600 text-white rounded-2xl text-[13px] font-black tracking-widest uppercase hover:bg-blue-700 transition-all active:scale-[0.98] shadow-xl shadow-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isInviting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Team Management</h1>
                        <p className="text-gray-500 font-medium">Manage cross-functional teams and role assignments.</p>
                    </div>
                    <button
                        onClick={() => setIsInviteModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
                    >
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
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm">
                                                {member.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{member.full_name}</div>
                                                <div className="text-xs text-gray-400">member@example.com</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${member.role === 'manager' ? 'bg-blue-50 text-blue-600' :
                                            member.role === 'developer' ? 'bg-primary/5 text-primary' :
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
