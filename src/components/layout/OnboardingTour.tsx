'use client'

import { useState, useEffect } from 'react'
import {
    Sparkles,
    ChevronRight,
    X,
    Target,
    Zap,
    ShieldCheck,
    BarChart3,
    MessageSquare,
    Bug
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
        title: "Welcome to TaskForge",
        description: "Welcome to your new AI-powered bug management command center. Let's show you how to forge a better workflow.",
        icon: Sparkles,
        color: "text-indigo-600 bg-indigo-50"
    },
    {
        title: "Intelligent Classification",
        description: "Submit bugs with ease. Our AI automatically predicts category, severity, and detects duplicates in real-time.",
        icon: Zap,
        color: "text-amber-600 bg-amber-50"
    },
    {
        title: "Executive Insights",
        description: "Managers get deep-dive analytics and AI health assessments to monitor project risk at a glance.",
        icon: BarChart3,
        color: "text-blue-600 bg-blue-50"
    },
    {
        title: "AI Triage Agent",
        description: "Need help fixing a bug? Our conversational AI assistant provides root cause analysis and step-by-step solutions.",
        icon: MessageSquare,
        color: "text-purple-600 bg-purple-50"
    }
]

export function OnboardingTour() {
    const [isOpen, setIsOpen] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('taskforge_onboarding_seen')
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
        localStorage.setItem('taskforge_onboarding_seen', 'true')
    }

    const step = STEPS[currentStep]
    const Icon = step.icon

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md bg-white rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
                <div className="relative p-10 flex flex-col items-center text-center">
                    <button
                        onClick={handleComplete}
                        className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className={cn("mb-6 p-6 rounded-3xl transition-all duration-500 transform scale-110", step.color)}>
                        <Icon className="w-12 h-12" />
                    </div>

                    <DialogTitle className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                        {step.title}
                    </DialogTitle>

                    <DialogDescription className="text-gray-500 font-medium leading-relaxed mb-10 max-w-[300px]">
                        {step.description}
                    </DialogDescription>

                    <div className="w-full space-y-4">
                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {currentStep === STEPS.length - 1 ? "Get Started" : "Next Milestone"}
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        <div className="flex justify-center gap-2">
                            {STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        i === currentStep ? "w-8 bg-indigo-600" : "w-1.5 bg-gray-200"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
