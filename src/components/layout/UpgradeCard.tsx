'use client'

import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UpgradeCard() {
    return (
        <div className="p-4 rounded-3xl bg-indigo-600 relative overflow-hidden group shadow-lg shadow-indigo-200">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

            <div className="relative z-10 flex flex-col gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white fill-white" />
                </div>

                <div className="space-y-1">
                    <h4 className="text-white font-bold text-sm leading-tight">Upgrade to Premium!</h4>
                    <p className="text-indigo-100 text-[10px] leading-relaxed opacity-90">
                        Upgrade your account and unlock all of the benefits.
                    </p>
                </div>

                <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-indigo-50 transition-all active:scale-95 shadow-sm">
                    Upgrade premium
                </button>
            </div>
        </div>
    )
}
