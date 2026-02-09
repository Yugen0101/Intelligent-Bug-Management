'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
    LayoutDashboard,
    Bug,
    FolderKanban,
    Settings,
    LogOut,
    AlertCircle,
    BarChart3,
    Users,
    Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
    role: 'tester' | 'developer' | 'manager'
    isMobile?: boolean
    onNavClick?: () => void
}

export function Sidebar({ role, isMobile, onNavClick }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    const navItems = [
        {
            title: 'Dashboard',
            href: `/dashboard/${role}`,
            icon: LayoutDashboard,
            active: pathname === `/dashboard/${role}`
        },
        {
            title: 'Bugs',
            href: `/dashboard/${role}/bugs`,
            icon: Bug,
            active: pathname.includes('/bugs')
        },
        {
            title: 'Projects',
            href: `/dashboard/${role}/projects`,
            icon: FolderKanban,
            active: pathname.includes('/projects')
        },
        // Manager only items
        ...(role === 'manager' ? [
            {
                title: 'Team',
                href: '/dashboard/manager/team',
                icon: Users,
                active: pathname.includes('/team')
            },
            {
                title: 'Insights',
                href: '/dashboard/manager/insights',
                icon: BarChart3,
                active: pathname.includes('/insights')
            }
        ] : []),
        {
            title: 'Settings',
            href: `/dashboard/${role}/settings`,
            icon: Settings,
            active: pathname.includes('/settings')
        }
    ]

    return (
        <aside className={cn(
            "h-full w-full bg-black/95 backdrop-blur-3xl border-r border-white/5 flex flex-col z-30 transition-all",
            !isMobile && "fixed left-0 top-0 w-64"
        )}>
            {/* Brand Identity */}
            <div className="p-8">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 bg-white p-1.5 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                        <img
                            src="/logo.png"
                            alt="Bug Mind"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white tracking-tighter leading-none">
                            Bug<span className="text-indigo-500">Mind</span>
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-500 mt-1">
                            Neural Node
                        </span>
                    </div>
                </Link>
            </div>

            {/* Navigation Flow */}
            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavClick}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-300 group",
                            item.active
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
                                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 transition-transform duration-500 group-hover:scale-110",
                            item.active ? "text-indigo-400" : "text-gray-500 group-hover:text-white"
                        )} />
                        <span>{item.title}</span>
                        {item.active && (
                            <div className="ml-auto w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* System Actions */}
            <div className="p-4 mt-auto border-t border-white/5 space-y-2">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Logout Sequence
                </button>

                <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5 mt-4">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Sparkles className="w-2.5 h-2.5" /> Neural Health
                    </p>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-4/5 h-full bg-indigo-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </aside>
    )
}
