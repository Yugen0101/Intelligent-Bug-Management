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
    BarChart3,
    Users,
    ChevronDown,
    Package,
    ShoppingCart,
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

    const mainNav = [
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
    ]

    const manageNav = [
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
            "h-full w-full bg-white flex flex-col z-30 transition-all",
            !isMobile && "fixed left-0 top-0 w-64 border-r border-gray-100/80"
        )}>
            {/* Brand Identity */}
            <div className="p-7 mb-2">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="w-8 h-8 bg-indigo-600 flex items-center justify-center rounded-xl group-hover:rotate-12 transition-transform duration-500 shadow-md shadow-indigo-100">
                        <Bug className="w-4.5 h-4.5 text-white" />
                    </div>
                    <span className="text-lg font-black text-gray-900 tracking-tight">
                        Bugmind
                    </span>
                    <div className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                </Link>
            </div>

            {/* Role Portal Indicator */}
            <div className="px-7 mb-6">
                <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                    role === 'manager' ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                        role === 'developer' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                )}>
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        role === 'manager' ? "bg-indigo-600" :
                            role === 'developer' ? "bg-emerald-600" :
                                "bg-amber-600"
                    )} />
                    {role} Portal
                </div>
            </div>

            {/* Navigation Flow */}
            <div className="flex-1 px-4 space-y-8 overflow-y-auto">
                {/* Main Section */}
                <nav className="space-y-1">
                    {mainNav.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavClick}
                            className={cn(
                                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 group relative",
                                item.active
                                    ? "bg-indigo-50/60 text-indigo-600"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
                            )}
                        >
                            <item.icon className={cn(
                                "w-4.5 h-4.5 transition-transform duration-500",
                                item.active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                            )} />
                            <span>{item.title}</span>
                            {item.active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full shadow-[0_0_12px_rgba(79,70,229,0.3)]" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Management Section */}
                <div className="space-y-3">
                    <h3 className="px-4 text-[11px] font-bold text-gray-400/80 uppercase tracking-widest flex items-center justify-between">
                        System
                        <ChevronDown className="w-3 h-3" />
                    </h3>
                    <nav className="space-y-1">
                        {manageNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavClick}
                                className={cn(
                                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 group relative",
                                    item.active
                                        ? "bg-indigo-50/60 text-indigo-600"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50/80"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-4.5 h-4.5 transition-transform duration-500",
                                    item.active ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
                                )} />
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 space-y-4">

                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Logout
                </button>
            </div>
        </aside>
    )
}

