import { NextResponse } from 'next/server';
import { geminiEngine } from '@/lib/ai/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { title, description } = await request.json();

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const prediction = await geminiEngine.predictBugMetadata(title, description);

        return NextResponse.json(prediction);
    } catch (error: any) {
        console.error('Gemini Prediction API Error:', error);

        if (error.message === "Gemini API key not configured") {
            return NextResponse.json({
                error: 'AI Prediction is currently disabled. Please configure your GEMINI_API_KEY.',
                isConfigError: true
            }, { status: 503 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
