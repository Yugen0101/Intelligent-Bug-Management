import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { OnboardingTour } from './OnboardingTour'
import type { UserRole } from '@/types/database'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
    children: React.ReactNode
    role: UserRole
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#f9fafb] flex overflow-x-hidden relative">
            {/* Subtle Light Background Pattern */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0 relative z-10">
                <Sidebar role={role} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden transition-transform duration-500 ease-in-out transform border-r border-gray-100",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="absolute top-4 right-4 lg:hidden z-[60]">
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-all bg-gray-50 rounded-lg border border-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <Sidebar role={role} isMobile onNavClick={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-h-screen w-full relative z-10">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1536px] mx-auto w-full">
                    <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </main>
            </div>
            <OnboardingTour />
        </div>
    )
}

