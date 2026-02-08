import { NextResponse } from 'next/server';
import { duplicateService } from '@/lib/ai/duplicates';

export async function POST(request: Request) {
    try {
        const { description, project_id } = await request.json();

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const duplicates = await duplicateService.findDuplicates(description, project_id);

        return NextResponse.json(duplicates);
    } catch (error: any) {
        console.error('Duplicate Detection API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
