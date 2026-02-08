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
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-400 hover:text-gray-900 lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search bugs, projects, or team members..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <NotificationDropdown />

                <div className="h-8 w-[1px] bg-gray-200 mx-1 md:mx-2 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-gray-900 leading-none">
                            {profile?.full_name || 'Loading...'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 capitalize font-black uppercase tracking-widest text-blue-600">
                            {profile?.role || 'User'}
                        </p>
                    </div>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 ring-2 ring-white">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <User className="w-5 h-5 md:w-6 md:h-6" />
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
