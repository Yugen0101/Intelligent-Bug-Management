import { createClient } from '@/lib/supabase/client'
import type { Bug, BugCategory, BugSeverity } from '@/types/database'

export interface CategoryDistribution {
    category: string
    count: number
    color: string
}

export interface SeverityDistribution {
    severity: string
    count: number
}

export interface WorkloadData {
    name: string
    bugs: number
}

export interface ResolutionEfficiency {
    date: string
    avgTime: number // in hours
}

export class AnalyticsService {
    private supabase = createClient()

    private categoryColors: Record<BugCategory, string> = {
        ui_ux: '#6366f1',
        functional: '#8b5cf6',
        performance: '#ec4899',
        security: '#f43f5e',
        data_logic: '#f59e0b',
        integration: '#10b981'
    }

    async getCategoryDistribution(projectId?: string): Promise<CategoryDistribution[]> {
        let query = this.supabase.from('bugs').select('category')
        if (projectId) query = query.eq('project_id', projectId)

        const { data, error } = await query
        if (error) throw error

        const distribution: Record<string, number> = {}
        data?.forEach(bug => {
            const cat = bug.category || 'unclassified'
            distribution[cat] = (distribution[cat] || 0) + 1
        })

        return Object.entries(distribution).map(([category, count]) => ({
            category,
            count,
            color: this.categoryColors[category as BugCategory] || '#94a3b8'
        }))
    }

    async getSeverityDistribution(projectId?: string): Promise<SeverityDistribution[]> {
        let query = this.supabase.from('bugs').select('severity')
        if (projectId) query = query.eq('project_id', projectId)

        const { data, error } = await query
        if (error) throw error

        const distribution: Record<string, number> = {}
        data?.forEach(bug => {
            const sev = bug.severity || 'low'
            distribution[sev] = (distribution[sev] || 0) + 1
        })

        const order: BugSeverity[] = ['critical', 'high', 'medium', 'low']
        return order.map(severity => ({
            severity,
            count: distribution[severity] || 0
        }))
    }

    async getWorkloadDistribution(projectId?: string): Promise<WorkloadData[]> {
        // This requires joining with bug_assignments and users
        const { data, error } = await this.supabase
            .from('bug_assignments')
            .select(`
                user_id,
                profiles:user_id (full_name),
                bugs!inner(project_id)
            `)

        if (error) throw error

        const filtered = projectId
            ? (data as any[]).filter(a => a.bugs?.project_id === projectId)
            : data

        const distribution: Record<string, number> = {}
        filtered.forEach(item => {
            const name = (item.profiles as any)?.full_name || 'Unknown'
            distribution[name] = (distribution[name] || 0) + 1
        })

        return Object.entries(distribution).map(([name, bugs]) => ({ name, bugs }))
    }

    async getResolutionEfficiency(projectId?: string): Promise<ResolutionEfficiency[]> {
        // Simplified: days to close for last 7 days
        let query = this.supabase.from('bugs').select('created_at, updated_at, status')
        if (projectId) query = query.eq('project_id', projectId)
        query = query.eq('status', 'resolved').limit(50)

        const { data, error } = await query
        if (error) throw error

        // Group by day and calculate avg
        const efficiency: Record<string, { total: number, count: number }> = {}

        data?.forEach(bug => {
            const start = new Date(bug.created_at)
            const end = new Date(bug.updated_at)
            const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
            const dateStr = start.toLocaleDateString()

            if (!efficiency[dateStr]) efficiency[dateStr] = { total: 0, count: 0 }
            efficiency[dateStr].total += diffHours
            efficiency[dateStr].count += 1
        })

        return Object.entries(efficiency).map(([date, stats]) => ({
            date,
            avgTime: Math.round(stats.total / stats.count)
        }))
    }

    async getProjectSummary(projectId: string) {
        // Fetch all relevant stats for Gemini to analyze
        const categories = await this.getCategoryDistribution(projectId)
        const severities = await this.getSeverityDistribution(projectId)
        const workload = await this.getWorkloadDistribution(projectId)

        const { count: openBugs } = await this.supabase
            .from('bugs')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId)
            .neq('status', 'resolved')

        return {
            projectId,
            openBugs,
            categories,
            severities,
            workload
        }
    }
}

export const analyticsService = new AnalyticsService()
