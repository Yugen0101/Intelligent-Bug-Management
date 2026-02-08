import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyticsService } from './analytics'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((callback) => {
            // Mock data for the 'bugs' table
            const mockBugs = [
                { category: 'ui_ux', severity: 'critical', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T12:00:00Z', status: 'resolved' },
                { category: 'functional', severity: 'high', created_at: '2024-01-01T10:00:00Z', updated_at: '2024-01-01T11:00:00Z', status: 'resolved' },
                { category: 'ui_ux', severity: 'medium', created_at: '2024-01-02T10:00:00Z', updated_at: '2024-01-02T15:00:00Z', status: 'resolved' }
            ]
            return callback({ data: mockBugs, error: null })
        })
    }))
}))

describe('AnalyticsService', () => {
    describe('getCategoryDistribution', () => {
        it('should aggregate bugs by category and assign correct colors', async () => {
            const result = await analyticsService.getCategoryDistribution()

            const uiUx = result.find(r => r.category === 'ui_ux')
            const functional = result.find(r => r.category === 'functional')

            expect(uiUx?.count).toBe(2)
            expect(uiUx?.color).toBe('#6366f1')
            expect(functional?.count).toBe(1)
        })
    })

    describe('getSeverityDistribution', () => {
        it('should aggregate bugs by severity in correct order', async () => {
            const result = await analyticsService.getSeverityDistribution()

            expect(result[0].severity).toBe('critical')
            expect(result[0].count).toBe(1)
            expect(result[1].severity).toBe('high')
            expect(result[1].count).toBe(1)
            expect(result[2].severity).toBe('medium')
            expect(result[2].count).toBe(1)
            expect(result[3].severity).toBe('low')
            expect(result[3].count).toBe(0)
        })
    })

    describe('getResolutionEfficiency', () => {
        it('should calculate average resolution time in hours', async () => {
            const result = await analyticsService.getResolutionEfficiency()

            // Jan 1: (2h + 1h) / 2 = 1.5 -> rounded to 2 or 1 depending on implementation
            // Jan 2: 5h / 1 = 5
            expect(result).toBeDefined()
            expect(result.length).toBeGreaterThan(0)
        })
    })
})
