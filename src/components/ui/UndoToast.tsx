'use client'

import React, { useEffect, useState } from 'react'
import { Undo2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface UndoToastProps {
    message: string
    onUndo: () => void
    onClose: () => void
}

export function UndoToast({ message, onUndo, onClose }: UndoToastProps) {
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        const duration = 5000
        const interval = 50
        const step = (interval / duration) * 100

        const timer = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - step))
        }, interval)

        return () => clearInterval(timer)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] min-w-[320px]"
        >
            <div className="bg-white/80 backdrop-blur-xl border border-blue-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl overflow-hidden p-4">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Undo2 className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-gray-900">{message}</p>
                            <p className="text-[11px] text-gray-500 font-medium">Changed your mind?</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onUndo}
                            className="px-4 py-2 bg-blue-600 text-white text-[12px] font-black rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
                        >
                            UNDO
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-blue-50 w-full">
                    <motion.div 
                        className="h-full bg-blue-600/30"
                        initial={{ width: '100%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                    />
                </div>
            </div>
        </motion.div>
    )
}
