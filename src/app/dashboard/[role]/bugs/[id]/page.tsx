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
    Edit2
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
        <div className="fixed bottom-6 right-6 p-4 bg-white border border-gray-100 rounded-2xl shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-gray-500">Initializing AI Agent...</span>
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
        // Validate that we have a valid ID before fetching
        if (!id || id === 'undefined') {
            setError('Invalid bug ID')
            setLoading(false)
            return
        }

        async function fetchBugData() {
            setLoading(true)
            try {
                // Fetch Bug
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

                // Fetch Comments
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

                // Fetch Assignment
                const { data: assignData } = await supabase
                    .from('bug_assignments')
                    .select('assigned_to')
                    .eq('bug_id', id)
                    .maybeSingle()

                setAssignment(assignData)

                // If manager, fetch developers for assignment dropdown
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

            // Upsert assignment
            const { error: assignError } = await supabase
                .from('bug_assignments')
                .upsert({
                    bug_id: id,
                    assigned_to: devId,
                    assigned_by: user.id
                })

            if (assignError) throw assignError
            setAssignment({ assigned_to: devId })

            // Send notification to the developer
            const dev = developers.find(d => d.id === devId)
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

            // Notify bug creator if the commenter isn't the creator
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

            // Refresh local state
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

            // Notify bug creator about status change
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

    if (loading) {
        return (
            <DashboardLayout role={role}>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Loading issue details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !bug) {
        return (
            <DashboardLayout role={role}>
                <div className="max-w-3xl mx-auto py-12 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900">Issue Not Found</h1>
                    <p className="text-gray-500 mt-2">{error || "The bug report you're looking for doesn't exist or you don't have permission to view it."}</p>
                    {process.env.NODE_ENV === 'development' && (
                        <p className="text-xs text-gray-400 mt-2">Debug: ID = "{id}"</p>
                    )}
                    <Link href={`/dashboard/${role}`} className="mt-8 inline-block text-blue-600 font-bold hover:underline">
                        Go back to dashboard
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    const severityColors: Record<string, string> = {
        critical: 'bg-red-100 text-red-700 border-red-200',
        high: 'bg-orange-100 text-orange-700 border-orange-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        low: 'bg-green-100 text-green-700 border-green-200',
    }

    const assignedDev = developers.find(d => d.id === assignment?.assigned_to)

    return (
        <DashboardLayout role={role}>
            <div className="max-w-6xl mx-auto py-6 space-y-8">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Link
                        href={`/dashboard/${role}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-3">
                        {role !== 'tester' && (
                            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                                {['open', 'in_progress', 'resolved'].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusUpdate(s as BugStatus)}
                                        className={cn(
                                            "px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                                            bug.status === s
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                                : "text-gray-500 hover:bg-gray-50"
                                        )}
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="flex flex-wrap gap-2 items-center">
                                    <Badge className={cn("font-bold uppercase tracking-wider px-3", severityColors[bug.severity || 'low'])}>
                                        {bug.severity}
                                    </Badge>
                                    <span className="text-sm font-black text-gray-500 tracking-tight">Issue #{bug.id.slice(0, 8)}</span>
                                </div>

                                <h1 className="text-3xl font-black text-gray-900 leading-tight">{bug.title}</h1>

                                <div className="flex flex-wrap items-center gap-6 py-4 border-y border-gray-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Reporter</p>
                                            <p className="text-xs font-bold text-gray-900">{bug.created_by_profile?.full_name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                                            <Tag className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Category</p>
                                            <p className="text-xs font-bold text-gray-900 capitalize">{bug.category?.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center text-amber-600">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Created</p>
                                            <p className="text-xs font-bold text-gray-900">{bug.created_at ? formatDistanceToNow(new Date(bug.created_at), { addSuffix: true }) : 'Recently'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-sm max-w-none">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                                        {bug.description}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights Card */}
                        {bug.ai_metadata?.category_prediction && (
                            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <AlertCircle className="w-32 h-32" />
                                </div>
                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                                            <AlertCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl">AI Diagnostic Insight</h3>
                                            <p className="text-indigo-200 text-sm font-medium">Automatic classification and analysis report.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Category Confidence</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold">{((bug.ai_metadata?.category_prediction?.confidence || 0) * 100).toFixed(0)}%</span>
                                                <Badge className="bg-indigo-500/30 text-white border-transparent capitalize">
                                                    {bug.ai_metadata?.category_prediction?.prediction}
                                                </Badge>
                                            </div>
                                            <p className="mt-3 text-xs text-indigo-100 font-medium leading-relaxed italic">
                                                "{bug.ai_metadata?.category_prediction?.explanation}"
                                            </p>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-2">Severity Impact</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-lg font-bold">{((bug.ai_metadata?.severity_prediction?.confidence || 0) * 100).toFixed(0)}%</span>
                                                <Badge className="bg-red-500/30 text-white border-transparent capitalize">
                                                    {bug.ai_metadata?.severity_prediction?.prediction}
                                                </Badge>
                                            </div>
                                            <p className="mt-3 text-xs text-indigo-100 font-medium leading-relaxed italic">
                                                "{bug.ai_metadata?.severity_prediction?.explanation}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                Activity Feed & Comments
                            </h3>

                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-500 uppercase shrink-0">
                                            {comment.user?.full_name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-900">{comment.user?.full_name}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                                    {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'Recently'}
                                                </span>
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl border border-gray-100 text-sm text-gray-600 shadow-sm leading-relaxed">
                                                {comment.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <form onSubmit={handleAddComment} className="flex gap-4 pt-4 border-t border-gray-100">
                                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center font-bold text-blue-400 uppercase shrink-0">
                                        Me
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            placeholder="Add an update or internal comment..."
                                            className="w-full bg-white border border-gray-200 rounded-2xl py-3 px-4 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-sm"
                                            rows={1}
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim() || submittingComment}
                                            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:bg-gray-300"
                                        >
                                            {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Metadata */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Project</h4>
                                    <p className="font-bold text-gray-900">{bug.project?.name}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1.5">Assigned To</h4>
                                    {role === 'manager' ? (
                                        <select
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 transition-all focus:ring-4 focus:ring-blue-500/10 outline-none"
                                            value={assignment?.assigned_to || ""}
                                            onChange={(e) => handleAssign(e.target.value)}
                                            disabled={submittingAssignment}
                                        >
                                            <option value="">Unassigned</option>
                                            {developers.map(dev => (
                                                <option key={dev.id} value={dev.id}>{dev.full_name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">
                                                {assignedDev?.full_name || "Unassigned"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">Status</h4>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            bug.status === 'open' ? "bg-blue-500" :
                                                bug.status === 'in_progress' ? "bg-purple-500" :
                                                    "bg-emerald-500"
                                        )} />
                                        <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                                            {bug.status?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <div className="space-y-3">
                            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                                <DialogTrigger asChild>
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Bug Report
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none shadow-2xl">
                                    <div className="p-6 bg-gray-900">
                                        <DialogTitle className="text-xl font-bold text-white">Edit Bug Report</DialogTitle>
                                        <DialogDescription className="text-gray-400">Update issue details and AI analysis will be preserved or updated.</DialogDescription>
                                    </div>
                                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                                        <BugForm
                                            initialData={bug}
                                            onSubmit={handleEditBug}
                                            submitLabel="Update Report"
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                                <DialogTrigger asChild>
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-red-50 rounded-2xl text-sm font-bold text-red-400 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Permanently
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[400px]">
                                    <DialogHeader>
                                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. This will permanently delete the bug report and all associated comments.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter className="mt-6 flex gap-3">
                                        <button
                                            onClick={() => setDeleteConfirmOpen(false)}
                                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            disabled={isDeleting}
                                            onClick={handleDeleteBug}
                                            className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            Delete Issue
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
