import { NextResponse } from 'next/server';
import { geminiEngine } from '@/lib/ai/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { message, context } = await request.json();

        if (!message || !context) {
            return NextResponse.json({ error: 'Message and context are required' }, { status: 400 });
        }

        const responseText = await geminiEngine.getAgentResponse(message, context);

        return NextResponse.json({ response: responseText });
    } catch (error: any) {
        console.error('Gemini Agent API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
