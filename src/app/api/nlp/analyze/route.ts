import { NextResponse } from 'next/server';
import { nlpEngine } from '@/lib/nlp/engine';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const analysis = await nlpEngine.analyzeBug(text);

        return NextResponse.json(analysis);
    } catch (error: any) {
        console.error('NLP API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
