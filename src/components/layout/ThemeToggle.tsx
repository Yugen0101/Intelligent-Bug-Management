'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl transition-all">
            <button
                onClick={() => setTheme('light')}
                className={cn(
                    "p-2 rounded-xl transition-all duration-500",
                    theme === 'light'
                        ? "bg-white text-black shadow-2xl scale-100"
                        : "text-gray-500 hover:text-white hover:bg-white/5 scale-90"
                )}
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={cn(
                    "p-2 rounded-xl transition-all duration-500",
                    theme === 'dark'
                        ? "bg-[#6366f1] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-100"
                        : "text-gray-500 hover:text-white hover:bg-white/5 scale-90"
                )}
            >
                <Moon className="w-4 h-4" />
            </button>
        </div>
    )
}
