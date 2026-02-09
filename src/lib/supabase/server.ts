import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

    const isValid = (val: string) => val && val !== 'undefined' && val !== 'null' && val.length > 10

    if (!isValid(url) || !isValid(key)) {
        console.warn('⚠️ Server-side Supabase configuration missing. Using placeholders.')
    }

    return createServerClient(
        isValid(url) ? url : 'https://placeholder.supabase.co',
        isValid(key) ? key : 'placeholder',
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
