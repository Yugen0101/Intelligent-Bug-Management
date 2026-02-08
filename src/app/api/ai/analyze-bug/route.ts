import { NextResponse } from 'next/server';
import { geminiEngine } from '@/lib/ai/gemini';

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

        // Handle specific "API Key not configured" error
        if (error.message === "Gemini API key not configured") {
            return NextResponse.json({
                error: 'AI Analysis is currently disabled. Please configure your GEMINI_API_KEY.',
                isConfigError: true
            }, { status: 503 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
