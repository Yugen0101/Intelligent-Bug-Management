'use client'
import { useEffect, useState } from 'react'

export default function DebugEnvPage() {
    const [status, setStatus] = useState<any>(null)

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        setStatus({
            urlPresent: !!url,
            urlLength: url?.length || 0,
            urlValue: url ? (url.substring(0, 15) + '...') : null,
            keyPresent: !!anonKey,
            keyLength: anonKey?.length || 0,
            isPlaceholder: (url?.includes('placeholder') || anonKey === 'placeholder')
        })
    }, [])

    if (!status) return <div>Loading debug info...</div>

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Environment Variable Debug 🛠️</h1>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm mb-6 shadow-xl">
                <pre>
                    {JSON.stringify(status, null, 2)}
                </pre>
            </div>

            <div className="space-y-4">
                {status.isPlaceholder ? (
                    <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                        <p className="font-bold text-lg mb-1">❌ PLACEHOLDERS DETECTED</p>
                        <p>The code is using "fake" placeholder values because your Vercel Build did not find the real environment variables.</p>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
                        <p className="font-bold text-lg mb-1">✅ REAL VALUES DETECTED</p>
                        <p>The bundle contains valid-looking Supabase credentials.</p>
                    </div>
                )}

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h2 className="font-bold text-blue-900 mb-2">How to Fix This:</h2>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                        <li>Go to <strong>Vercel Dashboard &gt; Settings &gt; Environment Variables</strong></li>
                        <li>Ensure <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are present.</li>
                        <li>Go to <strong>Deployments</strong> tab.</li>
                        <li>Click on the <strong>... (three dots)</strong> of your latest deployment.</li>
                        <li>Select <strong>Redeploy</strong> (ensure "Redeploy with existing build" is NOT checked if you want a fresh build).</li>
                    </ol>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 italic">
                Note: In Next.js, "NEXT_PUBLIC_" variables are hardcoded into the JavaScript bundle at <strong>BUILD TIME</strong>.
                If you add them to Vercel after the build is finished, the app won't see them until you rebuild/redeploy.
            </p>
        </div>
    )
}
