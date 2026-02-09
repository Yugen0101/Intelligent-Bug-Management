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
        <div className="min-h-screen bg-gray-50 flex overflow-x-hidden relative">
            {/* Subtle Light Background Grain/Noise or simple clear bg */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0 relative z-10">
                <Sidebar role={role} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden transition-transform duration-500 ease-in-out transform border-r border-gray-200",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="absolute top-4 right-4 lg:hidden z-[60]">
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-3 text-gray-500 hover:text-gray-900 transition-all bg-gray-50 rounded-xl border border-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <Sidebar role={role} isMobile onNavClick={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-h-screen w-full relative z-10">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-6 md:p-12 overflow-y-auto max-w-[1600px] mx-auto w-full">
                    <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
            <OnboardingTour />
        </div>
    )
}
