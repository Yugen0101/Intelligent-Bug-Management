'use client'

import { UndoProvider } from '@/components/providers/UndoProvider'

export default function DashboardRootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <UndoProvider>
            {children}
        </UndoProvider>
    )
}
