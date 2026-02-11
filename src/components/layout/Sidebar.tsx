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
            "h-full w-full bg-white border-r border-gray-200 flex flex-col z-30 transition-all",
            !isMobile && "fixed left-0 top-0 w-64"
        )}>
            {/* Brand Identity */}
            <div className="p-8">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform duration-500">
                        <Bug className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                            Bug<span className="text-blue-600">Mind</span>
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wider">
                            {role} Panel
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
                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group",
                            item.active
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
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
            <div className="p-4 mt-auto border-t border-gray-100 space-y-2">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all group"
                >
                    <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Logout
                </button>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mt-4">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        System Online
                    </p>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-green-500" />
                    </div>
                </div>
            </div>
        </aside>
    )
}
