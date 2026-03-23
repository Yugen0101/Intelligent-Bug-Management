'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Option {
    value: string
    label: string
    icon?: React.ReactNode
}

interface PremiumSelectProps {
    options: Option[]
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
    error?: string
    className?: string
    disabled?: boolean
    showNone?: boolean
    noneLabel?: string
}

export function PremiumSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    label,
    error,
    className,
    disabled = false,
    showNone = false,
    noneLabel = "None"
}: PremiumSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            {label && (
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full flex items-center justify-between px-4 py-3 bg-white border rounded-2xl transition-all duration-200 text-sm font-medium",
                    isOpen ? "border-blue-500 ring-4 ring-blue-50 shadow-sm" : "border-gray-200 hover:border-gray-300",
                    error ? "border-rose-500 focus:ring-rose-50" : "focus:border-blue-500 focus:ring-blue-50",
                    disabled && "opacity-50 cursor-not-allowed bg-gray-50",
                    "shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                )}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && (
                        <span className="shrink-0 text-blue-600">{selectedOption.icon}</span>
                    )}
                    <span className={cn(selectedOption ? "text-gray-900" : "text-gray-400")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={cn(
                    "w-4 h-4 text-gray-400 transition-transform duration-200",
                    isOpen && "rotate-180 text-blue-600"
                )} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 4, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-50 w-full bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden p-1.5"
                    >
                        <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                            {showNone && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onChange("")
                                        setIsOpen(false)
                                    }}
                                    className={cn(
                                        "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all group mb-1",
                                        !value
                                            ? "bg-blue-50 text-blue-700 font-bold"
                                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <div className="flex items-center gap-2 truncate text-xs uppercase tracking-widest font-black">
                                        <span>{noneLabel}</span>
                                    </div>
                                    {!value && (
                                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                                    )}
                                </button>
                            )}

                            {options.length === 0 && !showNone ? (
                                <div className="px-4 py-8 text-center text-xs text-gray-400 font-medium">
                                    No options available
                                </div>
                            ) : (
                                options.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value)
                                            setIsOpen(false)
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-all group",
                                            value === option.value
                                                ? "bg-blue-50 text-blue-700 font-bold"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            {option.icon && (
                                                <span className={cn(
                                                    "shrink-0",
                                                    value === option.value ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"
                                                )}>
                                                    {option.icon}
                                                </span>
                                            )}
                                            <span>{option.label}</span>
                                        </div>
                                        {value === option.value && (
                                            <Check className="w-4 h-4 text-blue-600 shrink-0" />
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <p className="mt-1.5 text-[10px] font-bold text-rose-500 px-1">
                    {error}
                </p>
            )}
        </div>
    )
}
