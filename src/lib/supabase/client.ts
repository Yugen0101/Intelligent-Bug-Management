import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
    const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

    const isValid = (val: string) => val && val !== 'undefined' && val !== 'null' && val.length > 10

    if (!isValid(url) || !isValid(key)) {
        console.warn('⚠️ Supabase configuration missing or invalid. Using placeholders. Please check Vercel Environment Variables.')
    }

    return createBrowserClient(
        isValid(url) ? url : 'https://placeholder.supabase.co',
        isValid(key) ? key : 'placeholder'
    )
}
