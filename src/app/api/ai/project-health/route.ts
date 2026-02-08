import { NextResponse } from 'next/server'
import { geminiEngine } from '@/lib/ai/gemini'
import { analyticsService } from '@/lib/ai/analytics'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId')

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
        }

        const stats = await analyticsService.getProjectSummary(projectId)
        const insight = await geminiEngine.generateProjectHealthInsight(stats)

        return NextResponse.json(insight)
    } catch (error) {
        console.error('Project Health API Error:', error)
        return NextResponse.json({ error: 'Failed to generate health insight' }, { status: 500 })
    }
}
