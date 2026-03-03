import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AIPriorityService } from '@/lib/ai/priority';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const priorityService = new AIPriorityService();

    try {
        // Fetch open bugs for the project
        const { data: bugs, error } = await supabase
            .from('bugs')
            .select(`
                *,
                assignments (
                    id,
                    assigned_to,
                    assigned_at
                )
            `)
            .eq('project_id', projectId)
            .neq('status', 'closed')
            .neq('status', 'resolved')
            .limit(20);

        if (error) throw error;

        const recommendations = await priorityService.rankBugs(bugs || []);

        return NextResponse.json(recommendations);
    } catch (error: any) {
        console.error('Priority API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
