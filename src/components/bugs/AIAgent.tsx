'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Sparkles,
    Send,
    Loader2,
    ChevronRight,
    Terminal,
    Lightbulb,
    CheckCircle2,
    MessageSquare,
    X,
    Minimize2,
    Maximize2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface AIAgentProps {
    bug: {
        id: string
        title: string
        description: string
        category?: string | null
        severity?: string | null
    }
    comments: any[]
}

type Message = {
    role: 'ai' | 'user'
    content: string
    type?: 'text' | 'solution' | 'steps'
    data?: any
}

export function AIAgent({ bug, comments }: AIAgentProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [diagnosis, setDiagnosis] = useState<any>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Initial Analysis
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            handleInitialAnalysis()
        }
    }, [isOpen])

    const handleInitialAnalysis = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/ai/analyze-bug', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: bug.description,
                    category: bug.category || 'general',
                    severity: bug.severity || 'low'
                })
            })

            const data = await response.json()

            if (data.isConfigError) {
                setMessages([{
                    role: 'ai',
                    content: "Hello! I'm your AI Triage Agent. It looks like the Gemini API key isn't configured yet. Please add it to your `.env.local` to enable my advanced reasoning capabilities."
                }])
                return
            }

            setDiagnosis(data)

            const rootCause = data.root_cause || "No clear root cause detected. Analyzing further...";
            const steps = Array.isArray(data.steps) ? data.steps : ["Verify configuration", "Check server logs", "Review recent changes"];

            setMessages([
                {
                    role: 'ai',
                    content: `I've analyzed the report. Based on the symptoms, I believe the root cause is: **${rootCause}**`
                },
                {
                    role: 'ai',
                    content: "Here are my suggested rectification steps:",
                    type: 'steps',
                    data: steps
                }
            ])

            if (data.fix_snippet) {
                setMessages(prev => [...prev, {
                    role: 'ai',
                    content: "I've also generated a potential fix snippet for you:",
                    type: 'solution',
                    data: data.fix_snippet
                }])
            }
        } catch (err) {
            setMessages([{
                role: 'ai',
                content: "I encountered an error while analyzing the bug. Please make sure the AI service is properly configured."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsLoading(true)

        try {
            const response = await fetch('/api/ai/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    context: {
                        description: bug.description,
                        comments: comments
                    }
                })
            })

            const data = await response.json()
            setMessages(prev => [...prev, { role: 'ai', content: data.response }])
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble responding right now." }])
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 bg-gray-900 text-white p-4 rounded-2xl shadow-xl hover:scale-110 transition-all group z-50 flex items-center gap-3"
            >
                <Sparkles className="w-5 h-5" />
                <span className="font-bold text-xs uppercase tracking-wider overflow-hidden max-w-0 group-hover:max-w-xs transition-all duration-500 whitespace-nowrap">
                    Ask AI Assistant
                </span>
            </button>
        )
    }

    return (
        <div
            className={cn(
                "fixed bottom-8 right-8 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl z-50 border border-gray-100 flex flex-col transition-all duration-300",
                isMinimized ? "h-16" : "h-[600px] max-h-[80vh]"
            )}
        >
            {/* Header */}
            <div className="p-4 bg-gray-900 border-b border-gray-800 rounded-t-3xl flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-[10px] uppercase tracking-wider">AI Triage Agent</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex flex-col gap-2 max-w-[85%]",
                                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                                        msg.role === 'user'
                                            ? "bg-blue-600 text-white rounded-tr-none"
                                            : "bg-white text-gray-700 rounded-tl-none border border-gray-100"
                                    )}
                                >
                                    {msg.content}
                                </div>

                                {msg.type === 'steps' && msg.data && Array.isArray(msg.data) && (
                                    <div className="w-full space-y-2 mt-1">
                                        {msg.data.map((step: string, j: number) => (
                                            <div key={j} className="flex gap-2 items-start bg-emerald-50 p-2 rounded-xl border border-emerald-100/50">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="text-xs text-emerald-900 font-medium">{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {msg.type === 'solution' && msg.data && (
                                    <div className="w-full mt-1 bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 border-b border-gray-700">
                                            <Terminal className="w-3 h-3 text-gray-400" />
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Suggested Fix</span>
                                        </div>
                                        <pre className="p-4 text-[11px] text-blue-300 font-mono overflow-x-auto bg-black/20">
                                            {msg.data}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">AI is thinking...</span>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shrink-0 rounded-b-3xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask a follow-up question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-2 p-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-sm disabled:opacity-20"
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    )
}
