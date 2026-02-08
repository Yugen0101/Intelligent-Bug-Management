import { describe, it, expect, vi } from 'vitest'
import { nlpEngine } from './engine'

// Mock transformers pipeline since we don't want to load actual models in unit tests
vi.mock('@xenova/transformers', () => ({
    pipeline: vi.fn().mockResolvedValue(() => ({
        data: new Float32Array(384).fill(0.1)
    })),
    env: {
        allowLocalModels: false,
        useBrowserCache: false
    }
}))

describe('NLPEngine', () => {
    describe('extractKeywords', () => {
        it('should extract meaningful candidate phrases using RAKE logic', () => {
            const text = "The application crashes on the payment checkout page specifically when using credit cards."
            // @ts-ignore - accessing private for testing
            const keywords = nlpEngine.extractKeywords(text)

            expect(keywords).toBeDefined()
            expect(keywords.length).toBeGreaterThan(0)
            // High score words like "payment checkout page" or "credit cards" should be present
            const joined = keywords.join(' ')
            expect(joined).toContain('payment')
            expect(joined).toContain('checkout')
        })
    })

    describe('extractEntities', () => {
        it('should detect technical components and error codes', () => {
            const text = "Database error 500 when calling the Auth API"
            // @ts-ignore - accessing private for testing
            const entities = nlpEngine.extractEntities(text)

            const components = entities.filter(e => e.label === 'COMPONENT').map(e => e.text)
            const errorCodes = entities.filter(e => e.label === 'ERROR_CODE').map(e => e.text)

            expect(components).toContain('Database')
            expect(components).toContain('Auth')
            expect(components).toContain('API')
            expect(errorCodes).toContain('500')
        })
    })

    describe('solveBug', () => {
        it('should return relevant solutions for auth issues', async () => {
            const result = await nlpEngine.solveBug("Login button does not respond and shows 401")
            expect(result.root_cause).toContain('Authentication')
            expect(result.steps).toContain('Verify the Supabase session token in browser storage.')
        })

        it('should return relevant solutions for UI issues', async () => {
            const result = await nlpEngine.solveBug("The layout is broken on mobile devices")
            expect(result.root_cause).toContain('UI Rendering')
            expect(result.fix_snippet).toContain('hidden md:flex')
        })
    })
})
