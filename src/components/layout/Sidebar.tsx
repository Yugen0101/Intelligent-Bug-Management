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
    Users
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
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-100">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-black text-gray-900 tracking-tight leading-none pt-1">
                        BugSense <span className="text-blue-600">AI</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavClick}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-sm font-bold",
                            item.active
                                ? "bg-blue-600 text-white shadow-xl shadow-blue-100"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                    >
                        <item.icon className={cn(
                            "w-5 h-5 transition-transform group-hover:scale-110",
                            item.active ? "text-white" : "text-gray-500 group-hover:text-blue-600"
                        )} />
                        {item.title}
                    </Link>
                ))}
            </nav>

            <div className="p-6 mt-auto border-t border-gray-50">
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all duration-300 group uppercase tracking-widest text-[10px]"
                >
                    <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Secure Sign Out
                </button>
            </div>
        </aside>
    )
}
