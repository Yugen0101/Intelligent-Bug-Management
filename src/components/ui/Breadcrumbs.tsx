'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Breadcrumbs() {
    const pathname = usePathname()
    
    // Split pathname into segments and filter out empty ones
    const segments = pathname.split('/').filter(Boolean)
    
    // Don't show breadcrumbs on auth pages or home
    if (segments[0] === 'auth' || segments.length === 0) {
        return null
    }

    // Map segments to human-readable titles
    const getTitle = (segment: string) => {
        const titles: Record<string, string> = {
            'dashboard': 'Home',
            'manager': 'Manager',
            'tester': 'Tester',
            'developer': 'Developer',
            'bugs': 'Bugs',
            'projects': 'Projects',
            'team': 'Team',
            'insights': 'Insights',
            'settings': 'Settings',
        }
        
        // Handle IDs (usually UUIDs) by showing a generic "Detail" label or keeping the ID truncated
        if (segment.length > 20 && (segment.includes('-') || /^\d+$/.test(segment))) {
            return 'Detail'
        }

        return titles[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    }

    return (
        <nav className="flex items-center space-x-2 text-[13px] font-medium text-gray-500 animate-in fade-in slide-in-from-left-2 duration-500">
            <Link 
                href="/dashboard"
                className="flex items-center gap-2 hover:text-blue-600 transition-all group p-1.5 -ml-1.5 rounded-lg hover:bg-blue-50/50"
            >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </Link>

            {segments.map((segment, index) => {
                const href = `/${segments.slice(0, index + 1).join('/')}`
                const isLast = index === segments.length - 1
                const title = getTitle(segment)

                // Skip the explicit "dashboard" segment if it's the first one, 
                // as we already have the Home icon
                if (index === 0 && segment === 'dashboard') return null

                return (
                    <div key={href} className="flex items-center space-x-2">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                        {isLast ? (
                            <span className="text-gray-900 font-bold bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100/50">
                                {title}
                            </span>
                        ) : (
                            <Link
                                href={href}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {title}
                            </Link>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}
