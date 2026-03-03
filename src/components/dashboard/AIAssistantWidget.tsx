'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Sparkles, Mic, Maximize2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
    role: 'ai' | 'user'
    content: string
}

export function AIAssistantWidget() {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isThinking])

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg = input.trim()
        setInput('')
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])

        setIsThinking(true)

        // Simulate AI response
        setTimeout(() => {
            const responses = [
                "I've analyzed the current bug trends. Resolution rate is up by 12% this week.",
                "You have 3 critical bugs pending. Would you like me to prioritize them for you?",
                "The team's workload is currently balanced, but 'Login issue' needs more attention.",
                "I recommend assigning the 'Database Timeout' bug to the backend team.",
            ]
            const randomResponse = responses[Math.floor(Math.random() * responses.length)]
            setMessages(prev => [...prev, { role: 'ai', content: randomResponse }])
            setIsThinking(false)
        }, 1500)
    }

    const quickPills = ['Bug summary', 'Team workload', 'Critical issues', 'Weekly report']

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col max-h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-[13px] font-bold text-gray-900">AI Assistant</span>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-[200px]"
            >
                {messages.length === 0 ? (
                    <div className="py-6 flex flex-col items-center text-center">
                        {/* Glowing Orb */}
                        <div className="relative mb-5 mt-2">
                            <div className="w-16 h-16 rounded-full bg-indigo-600 shadow-[0_0_40px_rgba(79,70,229,0.35)] animate-pulse" />
                            <div className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-tr from-indigo-800 via-indigo-500 to-indigo-300 opacity-80" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 blur-xl rounded-full" />
                        </div>

                        <h3 className="text-base font-black text-gray-900 mb-1">How can I help you?</h3>
                        <p className="text-gray-400 text-[11px] max-w-[200px] leading-relaxed mb-6">
                            Ask me about project health, bug trends, or team workload.
                        </p>

                        {/* Quick prompt pills */}
                        <div className="flex flex-wrap justify-center gap-2">
                            {quickPills.map((pill) => (
                                <button
                                    key={pill}
                                    onClick={() => { setInput(pill) }}
                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full hover:bg-indigo-100 transition-colors border border-indigo-100"
                                >
                                    {pill}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                                    msg.role === 'ai' ? "bg-indigo-50" : "bg-gray-100"
                                )}>
                                    {msg.role === 'ai' ? <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> : <User className="w-3.5 h-3.5 text-gray-600" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-[12px] max-w-[85%] leading-relaxed",
                                    msg.role === 'ai' ? "bg-indigo-50/50 text-gray-800" : "bg-gray-900 text-white shadow-sm"
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 animate-pulse">
                                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                                </div>
                                <div className="p-3 rounded-2xl bg-indigo-50/50 text-gray-400 text-[12px] flex items-center gap-1">
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                <div className="relative flex items-center bg-white border border-gray-100 rounded-2xl p-1.5 focus-within:shadow-md transition-all shadow-sm">
                    <input
                        type="text"
                        value={input}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-transparent border-none text-[12px] text-gray-900 placeholder-gray-400 focus:outline-none px-3"
                    />
                    <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                            <Mic className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSend}
                            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-100"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
