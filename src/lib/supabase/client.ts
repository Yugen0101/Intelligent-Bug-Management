import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

    return createBrowserClient(
        url && url !== 'undefined' ? url : 'https://placeholder.supabase.co',
        key && key !== 'undefined' ? key : 'placeholder'
    )
}
