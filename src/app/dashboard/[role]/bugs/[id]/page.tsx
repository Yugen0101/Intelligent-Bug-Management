'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    ArrowLeft,
    Clock,
    User,
    Tag,
    AlertCircle,
    MessageSquare,
    Send,
    Loader2,
    CheckCircle2,
    Trash2,
    Edit2,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { BugWithRelations, BugStatus, BugSeverity, Profile } from '@/types/database'
import { BugForm, type BugFormValues } from '@/components/bugs/BugForm'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { sendNotification } from '@/lib/utils/notifications'
import dynamic from 'next/dynamic'

const AIAgent = dynamic(() => import('@/components/bugs/AIAgent').then(mod => mod.AIAgent), {
    ssr: false,
    loading: () => (
        <div className="fixed bottom-6 right-6 p-4 bg-white/5 border border-white/10 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-3xl">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Initializing AI Core...</span>
        </div>
    )
})

interface BugDetailPageProps {
    params: Promise<{
        id: string
        role: 'tester' | 'developer' | 'manager'
    }>
}

export default function BugDetailPage({ params }: BugDetailPageProps) {
    const { id, role } = use(params)
    const [bug, setBug] = useState<BugWithRelations | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [newComment, setNewComment] = useState('')
    const [submittingComment, setSubmittingComment] = useState(false)
    const [comments, setComments] = useState<any[]>([])
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

    // Assignment states
    const [developers, setDevelopers] = useState<Profile[]>([])
    const [submittingAssignment, setSubmittingAssignment] = useState(false)
    const [assignment, setAssignment] = useState<{ assigned_to: string } | null>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        if (!id || id === 'undefined') {
            setError('Invalid bug ID')
            setLoading(false)
            return
        }

        async function fetchBugData() {
            setLoading(true)
            try {
                const { data: bugData, error: bugError } = await supabase
                    .from('bugs')
                    .select(`
            *,
            created_by_profile:profiles!bugs_created_by_fkey(*),
            project:projects(*)
          `)
                    .eq('id', id)
                    .single()

                if (bugError) throw bugError
                setBug(bugData)

                const { data: commentData, error: commentError } = await supabase
                    .from('comments')
                    .select(`
            *,
            user:profiles(*)
          `)
                    .eq('bug_id', id)
                    .order('created_at', { ascending: true })

                if (commentError) throw commentError
                setComments(commentData || [])

                const { data: assignData } = await supabase
                    .from('bug_assignments')
                    .select('assigned_to')
                    .eq('bug_id', id)
                    .maybeSingle()

                setAssignment(assignData)

                if (role === 'manager') {
                    const { data: devData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('role', 'developer')

                    setDevelopers(devData || [])
                }

            } catch (err: any) {
                setError(err.message || 'Failed to load bug details')
            } finally {
                setLoading(false)
            }
        }

        fetchBugData()
    }, [id, role])

    const handleAssign = async (devId: string) => {
        if (!devId || role !== 'manager') return
        setSubmittingAssignment(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { error: assignError } = await supabase
                .from('bug_assignments')
                .upsert({
                    bug_id: id,
                    assigned_to: devId,
                    assigned_by: user.id
                })

            if (assignError) throw assignError
            setAssignment({ assigned_to: devId })

            await sendNotification({
                userId: devId,
                type: 'assignment',
                title: 'New bug assigned to you',
                message: `You have been assigned to: ${bug?.title || 'a report'}`,
                link: `/dashboard/developer/bugs/${id}`
            })
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSubmittingAssignment(false)
        }
    }

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || submittingComment) return

        setSubmittingComment(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error: commentError } = await supabase
                .from('comments')
                .insert({
                    bug_id: id,
                    user_id: user.id,
                    content: newComment.trim()
                })
                .select(`
          *,
          user:profiles(*)
        `)
                .single()

            if (commentError) throw commentError

            setComments([...comments, data])
            setNewComment('')

            if (bug && bug.created_by && user.id !== bug.created_by) {
                await sendNotification({
                    userId: bug.created_by,
                    type: 'comment',
                    title: 'New comment on your report',
                    message: `${user.user_metadata?.full_name || 'Someone'} commented on: ${bug.title || 'your report'}`,
                    link: `/dashboard/${bug.created_by_profile?.role || 'tester'}/bugs/${id}`
                })
            }
        } catch (err: any) {
            alert(err.message)
        } finally {
            setSubmittingComment(false)
        }
    }

    const handleEditBug = async (values: BugFormValues, aiMetadata?: any) => {
        try {
            const { error: updateError } = await supabase
                .from('bugs')
                .update({
                    ...values,
                    ai_metadata: aiMetadata || bug?.ai_metadata
                })
                .eq('id', id)

            if (updateError) throw updateError

            setBug(prev => prev ? { ...prev, ...values, ai_metadata: aiMetadata || prev.ai_metadata } : null)
            setIsEditing(false)
        } catch (err: any) {
            alert(err.message)
        }
    }

    const handleDeleteBug = async () => {
        setIsDeleting(true)
        try {
            const { error: deleteError } = await supabase
                .from('bugs')
                .delete()
                .eq('id', id)

            if (deleteError) throw deleteError
            router.push(`/dashboard/${role}`)
        } catch (err: any) {
            alert(err.message)
            setIsDeleting(false)
            setDeleteConfirmOpen(false)
        }
    }

    const handleStatusUpdate = async (newStatus: BugStatus) => {
        try {
            const { error: updateError } = await supabase
                .from('bugs')
                .update({ status: newStatus })
                .eq('id', id)

            if (updateError) throw updateError
            setBug(prev => prev ? { ...prev, status: newStatus } : null)

            if (bug && bug.created_by) {
                const { data: { user } } = await supabase.auth.getUser()
                if (user && user.id !== bug.created_by) {
                    await sendNotification({
                        userId: bug.created_by,
                        type: 'status_update',
                        title: 'Bug status updated',
                        message: `The status of your report "${bug.title || 'Report'}" has been changed to ${newStatus.replace('_', ' ')}`,
                        link: `/dashboard/${bug.created_by_profile?.role || 'tester'}/bugs/${id}`
                    })
                }
            }
        } catch (err: any) {
            alert(err.message)
        }
    }

    const statusStyles: Record<BugStatus, string> = {
        open: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        resolved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        closed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        duplicate: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    }

    const severityStyles: Record<BugSeverity, string> = {
        critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]',
        high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    }

    if (loading) {
        return (
            <DashboardLayout role={role}>
                <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                        </div>
                    </div>
                    <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Synchronizing Neural Data...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !bug) {
        return (
            <DashboardLayout role={role}>
                <div className="max-w-3xl mx-auto py-32 text-center space-y-8">
                    <div className="w-24 h-24 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(244,63,94,0.1)]">
                        <AlertCircle className="w-10 h-10 text-rose-500" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Node Desynchronized</h1>
                        <p className="text-gray-500 font-medium max-w-md mx-auto">{error || "The anomaly signature you're requesting is outside current security clearance."}</p>
                    </div>
                    <Link href={`/dashboard/${role}`} className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-widest">
                        <ArrowLeft className="w-4 h-4" />
                        Return to Sector
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    const assignedDev = developers.find(d => d.id === assignment?.assigned_to)

    return (
        <DashboardLayout role={role}>
            <div className="max-w-[1400px] mx-auto py-8 px-4 space-y-12">
                {/* Header Navigation */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-4">
                    <div className="space-y-4">
                        <Link
                            href={`/dashboard/${role}`}
                            className="group inline-flex items-center gap-3 text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return Command
                        </Link>
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] shadow-[0_0_40px_rgba(79,70,229,0.1)]">
                                <AlertCircle className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Anomaly <span className="text-indigo-500">Record</span></h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                                        Signature ID: {bug.id.slice(0, 12)}
                                    </span>
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                        statusStyles[bug.status || 'open']
                                    )}>
                                        {bug.status?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {role !== 'tester' && (
                            <div className="flex bg-white/5 border border-white/10 rounded-[2rem] p-2 backdrop-blur-xl">
                                {(['open', 'in_progress', 'resolved'] as BugStatus[]).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusUpdate(s)}
                                        className={cn(
                                            "px-6 py-3 text-[10px] font-black rounded-2xl transition-all capitalize tracking-widest uppercase",
                                            bug.status === s
                                                ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                                : "text-gray-500 hover:text-white"
                                        )}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-12">
                        <div className="glass-card rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
                            {/* Background Glow */}
                            <div className="absolute top-0 right-0 w-full h-[400px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

                            <div className="p-12 border-b border-white/5 relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl",
                                        severityStyles[bug.severity || 'low']
                                    )}>
                                        Impact: {bug.severity}
                                    </span>
                                </div>

                                <h2 className="text-4xl font-black text-white leading-tight tracking-tighter mb-12 max-w-4xl">
                                    {bug.title}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 px-8 bg-white/5 border border-white/10 rounded-[2.5rem]">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                                            <User className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Originator</p>
                                            <p className="text-sm font-black text-white">{bug.created_by_profile?.full_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
                                            <Tag className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Vector Category</p>
                                            <p className="text-sm font-black text-white capitalize">{bug.category?.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                                            <Clock className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">Last Transmission</p>
                                            <p className="text-sm font-black text-white">{bug.created_at ? formatDistanceToNow(new Date(bug.created_at), { addSuffix: true }) : 'Recently'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-12 relative z-10">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-px bg-white/10 flex-1" />
                                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Diagnostic Data</p>
                                        <div className="h-px bg-white/10 flex-1" />
                                    </div>
                                    <div className="bg-black/20 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-sm shadow-inner group-hover:border-white/10 transition-colors">
                                        <p className="text-gray-300 leading-relaxed font-medium whitespace-pre-wrap text-lg">
                                            {bug.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights Card */}
                        {bug.ai_metadata?.category_prediction && (
                            <div className="bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-transparent rounded-[3.5rem] p-12 border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-indigo-500/20 transition-all duration-1000" />

                                <div className="relative z-10 space-y-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center backdrop-blur-3xl shadow-xl">
                                            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-3xl text-white tracking-tighter uppercase">Neural Diagnostic <span className="text-indigo-400">Layer</span></h3>
                                            <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Automated vector classification & reasoning matrix</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 hover:border-white/20 transition-all group/card">
                                            <div className="flex items-center justify-between mb-6">
                                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Classification Prob</p>
                                                <span className="text-2xl font-black text-white">{((bug.ai_metadata?.category_prediction?.confidence || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="bg-indigo-500/20 text-indigo-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-indigo-500/30">
                                                    {bug.ai_metadata?.category_prediction?.prediction}
                                                </span>
                                            </div>
                                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                                <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                                                    "{bug.ai_metadata?.category_prediction?.explanation}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 hover:border-white/20 transition-all group/card">
                                            <div className="flex items-center justify-between mb-6">
                                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Impact Probability</p>
                                                <span className="text-2xl font-black text-white">{((bug.ai_metadata?.severity_prediction?.confidence || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="flex items-center gap-3 mb-6">
                                                <span className="bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-rose-500/30">
                                                    {bug.ai_metadata?.severity_prediction?.prediction}
                                                </span>
                                            </div>
                                            <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                                <p className="text-sm text-gray-400 font-medium leading-relaxed italic">
                                                    "{bug.ai_metadata?.severity_prediction?.explanation}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Activity & Comments Section */}
                        <div className="space-y-10">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                                    <div className="p-2 bg-white/5 border border-white/10 rounded-xl">
                                        <MessageSquare className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    Communication Stream
                                </h3>
                                <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                    {comments.length} Data Points
                                </div>
                            </div>

                            <div className="space-y-8">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-6 group/comment animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xl shadow-lg shrink-0 backdrop-blur-xl group-hover/comment:border-indigo-500/30 transition-all">
                                            {comment.user?.full_name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 space-y-3 pt-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-black text-white tracking-tight">{comment.user?.full_name}</span>
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-lg">
                                                    {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'Recently'}
                                                </span>
                                            </div>
                                            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 text-sm text-gray-400 font-medium leading-relaxed group-hover/comment:bg-white/10 transition-all">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <form onSubmit={handleAddComment} className="flex gap-6 pt-12 border-t border-white/5">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-indigo-400 text-xl shadow-inner shrink-0 group-hover:border-indigo-500/40">
                                        Me
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            placeholder="Transmit update protocol..."
                                            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-5 px-8 pr-16 text-sm text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 transition-all resize-none font-medium placeholder:text-gray-700 h-[80px]"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || submittingComment}
                                            className="absolute right-3 top-3 w-12 h-12 bg-white text-black rounded-3xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-20 disabled:scale-100 shadow-xl"
                                        >
                                            {submittingComment ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Metadata */}
                    <div className="space-y-10">
                        <div className="glass-card rounded-[3rem] border border-white/10 p-10 space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full -mr-16 -mt-16" />

                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] pb-6 border-b border-white/5 mb-8">Node Parameters</h4>

                            <div className="space-y-10 relative z-10">
                                <div>
                                    <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Deployment Node</h5>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="font-black text-white tracking-tight">{bug.project?.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Tactical Assignment</h5>
                                    {role === 'manager' ? (
                                        <div className="relative group">
                                            <select
                                                className="w-full bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-4 text-xs font-black text-white transition-all focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer uppercase tracking-widest"
                                                value={assignment?.assigned_to || ""}
                                                onChange={(e) => handleAssign(e.target.value)}
                                                disabled={submittingAssignment}
                                            >
                                                <option value="" className="bg-gray-900">Idle Node</option>
                                                {developers.map(dev => (
                                                    <option key={dev.id} value={dev.id} className="bg-gray-900">{dev.full_name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                                                ↓
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-black text-white tracking-tight">
                                                    {assignedDev?.full_name || "Unassigned"}
                                                </span>
                                                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{assignedDev ? 'Active Protocol' : 'Waiting for lead'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-4">Status Matrix</h5>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                                        <div className={cn(
                                            "w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_currentColor]",
                                            bug.status === 'open' ? "text-indigo-400 bg-indigo-400" :
                                                bug.status === 'in_progress' ? "text-purple-400 bg-purple-400" :
                                                    "text-emerald-400 bg-emerald-400"
                                        )} />
                                        <span className="text-xs font-black text-white uppercase tracking-[0.2em]">
                                            {bug.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                <DialogTrigger asChild>
                                    <button
                                        className="w-full flex items-center justify-between px-8 py-5 bg-white/5 border border-white/10 rounded-[2rem] text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] group shadow-xl"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Edit2 className="w-4 h-4 text-indigo-400" />
                                            Update Protocol
                                        </span>
                                        <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border border-white/10 bg-gray-950 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                                    <div className="p-10 bg-gradient-to-br from-indigo-900/50 to-gray-950 border-b border-white/10">
                                        <DialogTitle className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Protocol Correction</DialogTitle>
                                        <DialogDescription className="text-gray-500 font-medium">Update anomaly data signatures. Neural analysis will re-verify the impact vectors.</DialogDescription>
                                    </div>
                                    <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        <div className="bg-white/5 rounded-[2.5rem] border border-white/5 p-8">
                                            <BugForm
                                                initialData={bug}
                                                onSubmit={handleEditBug}
                                                submitLabel="Submit Corrections"
                                            />
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className="w-full flex items-center gap-3 px-8 py-5 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] text-[10px] font-black text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all uppercase tracking-[0.2em]"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Expunge Record
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[450px] bg-gray-950 border border-white/10 rounded-[3rem] p-10 overflow-hidden">
                                    {/* Caution Glow */}
                                    <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />

                                    <DialogHeader className="relative z-10">
                                        <DialogTitle className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Critical Erasure</DialogTitle>
                                        <DialogDescription className="text-gray-400 font-medium leading-relaxed">
                                            This action will permanently expunge this anomaly from the neural database. This operation is irreversible.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="mt-12 flex flex-col sm:flex-row gap-4 relative z-10">
                                        <button
                                            onClick={() => setDeleteConfirmOpen(false)}
                                            className="flex-1 px-6 py-4 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all"
                                        >
                                            Abort Operation
                                        </button>
                                        <button
                                            disabled={isDeleting}
                                            onClick={handleDeleteBug}
                                            className="flex-1 px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black hover:bg-rose-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest shadow-[0_0_30px_rgba(225,29,72,0.3)]"
                                        >
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Expunge Data
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </div>
            <AIAgent bug={bug} comments={comments} />
        </DashboardLayout>
    )
}
