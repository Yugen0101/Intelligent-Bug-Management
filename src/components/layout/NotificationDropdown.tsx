'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Info, AlertTriangle, MessageSquare, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

interface Notification {
    id: string
    title: string
    message: string
    type: 'assignment' | 'comment' | 'status_update'
    read: boolean
    created_at: string
    link?: string
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10)

                if (error) throw error
                setNotifications(data || [])
                setUnreadCount(data?.filter(n => !n.read).length || 0)
            } catch (err) {
                console.error('Error fetching notifications:', err)
            }
        }

        fetchNotifications()

        // Real-time subscription
        const channel = supabase
            .channel('notifications_changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    const newNotif = payload.new as Notification
                    setNotifications(prev => [newNotif, ...prev].slice(0, 10))
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('id', id)

            if (error) throw error

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (err) {
            console.error('Error marking notification as read:', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('notifications')
                .update({ read: true })
                .eq('user_id', user.id)
                .eq('read', false)

            if (error) throw error

            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (err) {
            console.error('Error marking all notifications as read:', err)
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'assignment': return <UserPlus className="w-4 h-4 text-blue-500" />
            case 'comment': return <MessageSquare className="w-4 h-4 text-purple-500" />
            case 'status_update': return <Check className="w-4 h-4 text-green-500" />
            default: return <Info className="w-4 h-4 text-gray-500" />
        }
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-white/5 rounded-lg relative text-gray-500 transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#050505] animate-pulse"></span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl shadow-2xl border-white/10 bg-[#0a0a0a] overflow-hidden">
                <div className="p-4 bg-white/5 flex items-center justify-between border-b border-white/5">
                    <DropdownMenuLabel className="p-0 font-bold text-white">Notifications</DropdownMenuLabel>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                markAllAsRead()
                            }}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-gray-500">
                                <Bell className="w-6 h-6" />
                            </div>
                            <p className="text-sm font-bold text-white">All caught up!</p>
                            <p className="text-xs text-gray-500">No new notifications at the moment.</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={cn(
                                    "p-4 cursor-pointer focus:bg-white/5 transition-colors border-b border-white/5 last:border-0",
                                    !n.read && "bg-indigo-500/5"
                                )}
                                onSelect={() => markAsRead(n.id)}
                            >
                                <div className="flex gap-3 w-full">
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                        n.type === 'assignment' ? "bg-indigo-500/10" :
                                            n.type === 'comment' ? "bg-purple-500/10" :
                                                "bg-emerald-500/10"
                                    )}>
                                        {getIcon(n.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn("text-xs font-bold leading-none", n.read ? "text-gray-400" : "text-white")}>
                                                {n.title}
                                            </p>
                                            {!n.read && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></div>}
                                        </div>
                                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                                            {n.message}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight pt-1">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                <DropdownMenuSeparator className="m-0 bg-white/5" />
                <div className="p-2">
                    <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        View all activity
                    </button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
