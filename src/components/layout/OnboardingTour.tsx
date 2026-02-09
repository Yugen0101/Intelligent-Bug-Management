'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Sparkles,
    ChevronRight,
    X,
    Zap,
    BarChart3,
    MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"

const STEPS = [
    {
        title: "Welcome to Bug Mind",
        description: "Welcome to your new AI-powered bug management command center. Let's show you how to forge a better workflow.",
        icon: Sparkles,
        color: "text-indigo-600 bg-indigo-50",
        bgGradient: "from-indigo-500/10 via-purple-500/5 to-transparent shadow-indigo-500/20"
    },
    {
        title: "Intelligent Classification",
        description: "Submit bugs with ease. Our AI automatically predicts category, severity, and detects duplicates in real-time.",
        icon: Zap,
        color: "text-amber-600 bg-amber-50",
        bgGradient: "from-amber-500/10 via-orange-500/5 to-transparent shadow-amber-500/20"
    },
    {
        title: "Executive Insights",
        description: "Managers get deep-dive analytics and AI health assessments to monitor project risk at a glance.",
        icon: BarChart3,
        color: "text-blue-600 bg-blue-50",
        bgGradient: "from-blue-500/10 via-cyan-500/5 to-transparent shadow-blue-500/20"
    },
    {
        title: "AI Triage Agent",
        description: "Need help fixing a bug? Our conversational AI assistant provides root cause analysis and step-by-step solutions.",
        icon: MessageSquare,
        color: "text-purple-600 bg-purple-50",
        bgGradient: "from-purple-500/10 via-pink-500/5 to-transparent shadow-purple-500/20"
    }
]

export function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('bugmind_onboarding_seen')
        if (!hasSeenTour) {
            const timer = setTimeout(() => setIsOpen(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            handleComplete()
        }
    }

    const handleComplete = () => {
        setIsOpen(false)
        localStorage.setItem('bugmind_onboarding_seen', 'true')
    }

    const step = STEPS[currentStep]
    const Icon = step.icon

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md bg-white/80 backdrop-blur-xl rounded-[3.5rem] border border-white/40 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] p-0 overflow-hidden ring-1 ring-black/5">
                <div className="relative overflow-hidden">
                    {/* Dynamic Ambient Background */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className={cn(
                                "absolute inset-0 bg-gradient-to-br -z-10 transition-colors duration-1000",
                                step.bgGradient
                            )}
                        />
                    </AnimatePresence>

                    {/* Animated Decorative Blobs */}
                    <div className="absolute top-0 -left-10 w-40 h-40 bg-indigo-400/10 blur-[80px] rounded-full animate-pulse" />
                    <div className="absolute bottom-0 -right-10 w-40 h-40 bg-purple-400/10 blur-[80px] rounded-full animate-pulse delay-1000" />

                    <div className="relative p-12 flex flex-col items-center text-center min-h-[540px] justify-between">
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleComplete}
                            className="absolute top-8 right-8 p-2.5 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50/50 hover:bg-gray-100/50 rounded-2xl"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>

                        <div className="flex-1 flex flex-col items-center justify-center w-full">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    exit={{ y: -20, opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-full flex flex-col items-center"
                                >
                                    <div className={cn(
                                        "mb-10 p-8 rounded-[2.5rem] shadow-inner transition-all duration-500",
                                        step.color
                                    )}>
                                        <Icon className="w-16 h-16" />
                                    </div>

                                    <DialogTitle className="text-4xl font-black text-gray-900 mb-5 tracking-tight px-4 leading-[1.1]">
                                        {step.title}
                                    </DialogTitle>

                                    <DialogDescription className="text-gray-500 text-lg font-medium leading-relaxed mb-4 max-w-[320px]">
                                        {step.description}
                                    </DialogDescription>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="w-full space-y-8 mt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleNext}
                                className="w-full py-5 bg-gray-900 text-white font-bold uppercase tracking-[0.2em] rounded-3xl hover:bg-black transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 active:scale-[0.98] group"
                            >
                                {currentStep === STEPS.length - 1 ? "Start Forging" : "Next Milestone"}
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </motion.button>

                            <div className="flex justify-center gap-3">
                                {STEPS.map((_, i) => (
                                    <div
                                        key={i}
                                        className="relative h-2 w-16 bg-gray-100 rounded-full overflow-hidden"
                                    >
                                        <motion.div
                                            className={cn(
                                                "absolute inset-0 bg-indigo-600 rounded-full",
                                                i < currentStep ? "opacity-30" : ""
                                            )}
                                            initial={false}
                                            animate={{
                                                x: i === currentStep ? 0 : (i < currentStep ? 0 : -100),
                                                opacity: i === currentStep ? 1 : (i < currentStep ? 1 : 0)
                                            }}
                                            transition={{ duration: 0.5, ease: "circOut" }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

