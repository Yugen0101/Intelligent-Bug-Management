'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, UserRole } from '@/types/database'

export function useProfiles(roles?: UserRole[]) {
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchProfiles() {
            setLoading(true)
            try {
                let query = supabase
                    .from('profiles')
                    .select('*')
                    .order('full_name')

                if (roles && roles.length > 0) {
                    query = query.in('role', roles)
                }

                const { data, error } = await query

                if (error) throw error
                setProfiles(data || [])
            } catch (err: any) {
                console.error('Error fetching profiles:', err.message)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProfiles()
    }, [roles, supabase])

    return { profiles, loading, error }
}
