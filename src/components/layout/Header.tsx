import { Bell, Search, User, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationDropdown } from './NotificationDropdown'
import type { Profile } from '@/types/database'

interface HeaderProps {
    onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
    const [profile, setProfile] = useState<Profile | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function getProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setProfile(data)
            }
        }
        getProfile()
    }, [])

    return (
        <header className="h-20 bg-black/50 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-6 md:px-10 sticky top-0 z-20">
            <div className="flex items-center gap-6 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-3 -ml-3 text-gray-500 hover:text-white lg:hidden transition-all rounded-xl hover:bg-white/5"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="relative w-full max-w-lg hidden md:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Scan neural database for signatures..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                <div className="flex items-center">
                    <NotificationDropdown />
                </div>

                <div className="h-6 w-[1px] bg-white/10 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-white leading-none tracking-tight">
                            {profile?.full_name || 'Loading Core...'}
                        </p>
                        <p className="text-[9px] text-indigo-400 mt-1.5 capitalize font-black uppercase tracking-[0.2em] opacity-80">
                            {profile?.role || 'Guest Entity'}
                        </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-transform hover:scale-105 cursor-pointer overflow-hidden group">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <div className="bg-indigo-500/10 w-full h-full flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                <User className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
