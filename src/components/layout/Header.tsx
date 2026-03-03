import { Bell, Search, User, Menu, Sun, Moon } from 'lucide-react'
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
        <header className="h-16 bg-white/60 backdrop-blur-md border-b border-gray-100/50 flex items-center justify-between px-6 md:px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 lg:hidden transition-all rounded-xl hover:bg-gray-50"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="relative w-full max-w-sm hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full pl-9 pr-12 py-2 bg-[#f9fafb] border border-gray-100 rounded-xl text-[13px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/5 focus:border-indigo-600/20 transition-all font-medium"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 bg-white border border-gray-100 rounded-md shadow-sm">
                        <span className="text-[10px] font-black text-gray-400">⌘K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-gray-50">
                        <Sun className="w-4.5 h-4.5" />
                    </button>
                    <NotificationDropdown />
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-50 transition-all group">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                            <div className="bg-indigo-50 w-full h-full flex items-center justify-center">
                                <User className="w-4 h-4 text-indigo-400" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

