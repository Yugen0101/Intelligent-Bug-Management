import { NextResponse } from 'next/server';
import { nlpEngine } from '@/lib/nlp/engine';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const solution = await nlpEngine.solveBug(text);

        return NextResponse.json(solution);
    } catch (error: any) {
        console.error('NLP Solution API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
