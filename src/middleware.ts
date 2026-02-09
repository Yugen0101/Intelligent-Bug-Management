import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    try {
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // 1. Protect dashboard routes
        if (request.nextUrl.pathname.startsWith('/dashboard')) {
            if (!user) {
                return NextResponse.redirect(new URL('/auth/login', request.url))
            }

            // 2. Role-based protection
            // Get user role from public.profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile) {
                // If profile doesn't exist yet, sign out and redirect to login
                await supabase.auth.signOut()
                return NextResponse.redirect(new URL('/auth/login', request.url))
            }

            const { role } = profile
            const path = request.nextUrl.pathname

            // Cross-role protection
            if (path.startsWith('/dashboard/manager') && role !== 'manager') {
                return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
            }
            if (path.startsWith('/dashboard/developer') && role !== 'developer') {
                return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
            }
            if (path.startsWith('/dashboard/tester') && role !== 'tester') {
                return NextResponse.redirect(new URL('/dashboard/' + role, request.url))
            }
        }

        // 3. Redirect authenticated users away from auth pages
        if (user && request.nextUrl.pathname.startsWith('/auth')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile) {
                return NextResponse.redirect(new URL('/dashboard/' + profile.role, request.url))
            }
        }
    } catch (e) {
        console.error('Middleware execution failed:', e)
        // If everything fails, just let the request proceed to the application 
        // which will likely show a more helpful error or the login page.
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
