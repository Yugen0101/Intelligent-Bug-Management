import { NextResponse } from 'next/server';
import { geminiEngine } from '@/lib/ai/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { description, category, severity } = await request.json();

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const diagnosis = await geminiEngine.analyzeBug(description, category, severity);

        return NextResponse.json(diagnosis);
    } catch (error: any) {
        console.error('Gemini Analysis API Error:', error);

        // Handle specific error messages
        if (error.message === "GEMINI_NOT_CONFIGURED") {
            return NextResponse.json({
                error: 'AI Analysis is currently disabled. Please configure your GEMINI_API_KEY.',
                isConfigError: true
            }, { status: 503 });
        }

        if (error.message === "INVALID_API_KEY") {
            return NextResponse.json({
                error: 'Invalid or expired API key. Please generate a new key at https://aistudio.google.com/app/apikey',
                isConfigError: true
            }, { status: 401 });
        }

        return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
    }
}
