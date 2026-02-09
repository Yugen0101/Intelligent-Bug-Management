import { Bell, Search, User, Menu } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NotificationDropdown } from './NotificationDropdown'
import type { Profile } from '@/types/database'
import { ThemeToggle } from './ThemeToggle'

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
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-20 transition-colors">
            <div className="flex items-center gap-6 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-3 -ml-3 text-gray-500 hover:text-gray-900 lg:hidden transition-all rounded-xl hover:bg-gray-100"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="relative w-full max-w-lg hidden md:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search bugs..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-8">
                {/* ThemeToggle removed as per "no need of dark theme" */}
                <div className="flex items-center">
                    <NotificationDropdown />
                </div>

                <div className="h-6 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900 leading-none">
                            {profile?.full_name || 'Loading Core...'}
                        </p>
                        <p className="text-[10px] text-blue-600 mt-1 font-bold uppercase tracking-wider">
                            {profile?.role || 'Guest'}
                        </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-700 border border-gray-200 transition-transform hover:scale-105 cursor-pointer overflow-hidden group">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <div className="bg-blue-50 w-full h-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                <User className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
