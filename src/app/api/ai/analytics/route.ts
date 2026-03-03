import { NextResponse } from 'next/server'
import { analyticsService } from '@/lib/ai/analytics'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const projectId = searchParams.get('projectId') || undefined
        const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : undefined

        const [categories, severities, workload, efficiency] = await Promise.all([
            analyticsService.getCategoryDistribution(projectId, days),
            analyticsService.getSeverityDistribution(projectId, days),
            analyticsService.getWorkloadDistribution(projectId),
            analyticsService.getResolutionEfficiency(projectId, days)
        ])

        return NextResponse.json({
            categories,
            severities,
            workload,
            efficiency
        })
    } catch (error) {
        console.error('Analytics API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }
}
