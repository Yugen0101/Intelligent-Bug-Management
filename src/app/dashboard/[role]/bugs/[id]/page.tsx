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
        <div className="fixed bottom-6 right-6 p-4 bg-white border border-gray-200 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Assistant Loading...</span>
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
        open: 'bg-blue-50 text-blue-700 border-blue-100',
        in_progress: 'bg-purple-50 text-purple-700 border-purple-100',
        resolved: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        closed: 'bg-gray-50 text-gray-700 border-gray-100',
        duplicate: 'bg-amber-50 text-amber-700 border-amber-100'
    }

    const severityStyles: Record<BugSeverity, string> = {
        critical: 'bg-red-50 text-red-700 border-red-100 shadow-sm',
        high: 'bg-orange-50 text-orange-700 border-orange-100',
        medium: 'bg-amber-50 text-amber-700 border-amber-100',
        low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    }

    if (loading) {
        return (
            <DashboardLayout role={role}>
                <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Bug Details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !bug) {
        return (
            <DashboardLayout role={role}>
                <div className="max-w-3xl mx-auto py-32 text-center space-y-8">
                    <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Report Not Found</h1>
                        <p className="text-gray-600 font-medium max-w-md mx-auto">{error || "The bug report you're looking for doesn't exist or you don't have access."}</p>
                    </div>
                    <Link href={`/dashboard/${role}`} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all uppercase tracking-wide">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
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
                            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all uppercase tracking-wider"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl">
                                <AlertCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">Bug <span className="text-blue-600">Details</span></h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                        ID: {bug.id.slice(0, 8)}
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
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
                            <div className="flex bg-gray-100 border border-gray-200 rounded-2xl p-1">
                                {(['open', 'in_progress', 'resolved'] as BugStatus[]).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusUpdate(s)}
                                        className={cn(
                                            "px-4 py-2 text-[10px] font-bold rounded-xl transition-all capitalize tracking-wider uppercase",
                                            bug.status === s
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500 hover:text-gray-900"
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
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-100 relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                                        severityStyles[bug.severity || 'low']
                                    )}>
                                        {bug.severity} Severity
                                    </span>
                                </div>

                                <h2 className="text-3xl font-bold text-gray-900 leading-tight tracking-tight mb-8">
                                    {bug.title}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                                            <User className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Reporter</p>
                                            <p className="text-sm font-bold text-gray-900">{bug.created_by_profile?.full_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                                            <Tag className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Category</p>
                                            <p className="text-sm font-bold text-gray-900 capitalize">{bug.category?.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                                            <Clock className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Reported</p>
                                            <p className="text-sm font-bold text-gray-900">{bug.created_at ? formatDistanceToNow(new Date(bug.created_at), { addSuffix: true }) : 'Recently'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</h3>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                                        <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                                            {bug.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights Card */}
                        {bug.ai_metadata?.category_prediction && (
                            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden group">
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shadow-sm">
                                            <Sparkles className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 tracking-tight">AI Analysis</h3>
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Classification & Priority Vectors</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Category Confidence</p>
                                                <span className="text-xl font-bold text-gray-900">{((bug.ai_metadata?.category_prediction?.confidence || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                    {bug.ai_metadata?.category_prediction?.prediction}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                                                "{bug.ai_metadata?.category_prediction?.explanation}"
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Severity Confidence</p>
                                                <span className="text-xl font-bold text-gray-900">{((bug.ai_metadata?.severity_prediction?.confidence || 0) * 100).toFixed(0)}%</span>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                    {bug.ai_metadata?.severity_prediction?.prediction}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 font-medium leading-relaxed italic">
                                                "{bug.ai_metadata?.severity_prediction?.explanation}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Activity & Comments Section */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-gray-400" />
                                    Discussion
                                </h3>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {comments.length} Comments
                                </div>
                            </div>

                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4 group/comment animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-700 text-lg shadow-sm shrink-0">
                                            {comment.user?.full_name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 space-y-2 pt-0.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-900">{comment.user?.full_name}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                                    {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'Recently'}
                                                </span>
                                            </div>
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 text-sm text-gray-600 font-medium leading-relaxed shadow-sm">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <form onSubmit={handleAddComment} className="flex gap-4 pt-8 border-t border-gray-100">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-lg shrink-0">
                                        Me
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            placeholder="Write a comment..."
                                            className="w-full bg-white border border-gray-200 rounded-2xl py-4 px-6 pr-14 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all resize-none font-medium placeholder:text-gray-400 h-[80px] shadow-sm"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || submittingComment}
                                            className="absolute right-2 top-2 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-all disabled:opacity-20 shadow-sm"
                                        >
                                            {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Metadata */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl border border-gray-200 p-8 space-y-8 shadow-sm">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-4 border-b border-gray-50 mb-6">Details</h4>

                            <div className="space-y-8 relative z-10">
                                <div>
                                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-3">Project</h5>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="font-bold text-gray-900 text-sm">{bug.project?.name}</p>
                                    </div>
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-3">Assigned To</h5>
                                    {role === 'manager' ? (
                                        <div className="relative">
                                            <select
                                                className="w-full bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none cursor-pointer appearance-none transition-all focus:ring-2 focus:ring-blue-100"
                                                value={assignment?.assigned_to || ""}
                                                onChange={(e) => handleAssign(e.target.value)}
                                                disabled={submittingAssignment}
                                            >
                                                <option value="">Unassigned</option>
                                                {developers.map(dev => (
                                                    <option key={dev.id} value={dev.id}>{dev.full_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                                                    {assignedDev?.full_name || "Unassigned"}
                                                </p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{assignedDev ? 'Active' : 'Not assigned'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-3">Current Status</h5>
                                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            bug.status === 'open' ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" :
                                                bug.status === 'in_progress' ? "bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.4)]" :
                                                    "bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]"
                                        )} />
                                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                            {bug.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                <DialogTrigger asChild>
                                    <button
                                        className="w-full flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all uppercase tracking-wider group shadow-sm"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Edit2 className="w-4 h-4 text-gray-400" />
                                            Edit Report
                                        </span>
                                        <Sparkles className="w-4 h-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none bg-white rounded-[2rem] shadow-2xl">
                                    <div className="p-8 bg-gray-50 border-b border-gray-200">
                                        <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Edit Bug Report</DialogTitle>
                                        <DialogDescription className="text-gray-500 font-medium">Update the details for this bug. AI analysis will re-check the category and severity.</DialogDescription>
                                    </div>
                                    <div className="p-8 max-h-[70vh] overflow-y-auto">
                                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                                            <BugForm
                                                initialData={bug}
                                                onSubmit={handleEditBug}
                                                submitLabel="Save Changes"
                                            />
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className="w-full flex items-center gap-2 px-6 py-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-100 transition-all uppercase tracking-wider"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Bug Report
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[450px] bg-white border-none rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight mb-2">Delete Report?</DialogTitle>
                                        <DialogDescription className="text-gray-500 font-medium leading-relaxed">
                                            This will permanently delete this bug from the system. This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="mt-8 flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={() => setDeleteConfirmOpen(false)}
                                            className="flex-1 px-4 py-3 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={isDeleting}
                                            onClick={handleDeleteBug}
                                            className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm"
                                        >
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Confirm Delete
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
