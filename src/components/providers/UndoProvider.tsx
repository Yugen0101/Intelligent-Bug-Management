'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { UndoToast } from '../ui/UndoToast'

interface UndoAction {
    id: string
    message: string
    undo: () => Promise<void> | void
}

interface UndoContextType {
    addAction: (message: string, undo: () => Promise<void> | void) => void
    lastAction: UndoAction | null
    clearAction: () => void
}

const UndoContext = createContext<UndoContextType | undefined>(undefined)

export function UndoProvider({ children }: { children: React.ReactNode }) {
    const [lastAction, setLastAction] = useState<UndoAction | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const clearAction = useCallback(() => {
        setLastAction(null)
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const addAction = useCallback((message: string, undo: () => Promise<void> | void) => {
        // Clear existing action if any
        if (timerRef.current) clearTimeout(timerRef.current)

        const id = Math.random().toString(36).substr(2, 9)
        setLastAction({ id, message, undo })

        // Auto-clear after 5 seconds
        timerRef.current = setTimeout(() => {
            setLastAction(null)
        }, 5000)
    }, [])

    return (
        <UndoContext.Provider value={{ addAction, lastAction, clearAction }}>
            {children}
            {lastAction && (
                <UndoToast 
                    key={lastAction.id}
                    message={lastAction.message}
                    onUndo={async () => {
                        await lastAction.undo()
                        clearAction()
                    }}
                    onClose={clearAction}
                />
            )}
        </UndoContext.Provider>
    )
}

export const useUndo = () => {
    const context = useContext(UndoContext)
    if (context === undefined) {
        throw new Error('useUndo must be used within an UndoProvider')
    }
    return context
}
