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
        <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0">
                <Sidebar role={role} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <div className={cn(
                "fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden transition-transform duration-500 ease-in-out transform shadow-2xl",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="absolute top-4 right-4 lg:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <Sidebar role={role} isMobile onNavClick={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-h-screen w-full relative">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
                    {children}
                </main>
            </div>
            <OnboardingTour />
        </div>
    )
}
