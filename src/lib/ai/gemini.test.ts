import { vi, describe, it, expect, beforeEach } from 'vitest'

// 1. Mock MUST be before any imports that use it
vi.mock('@google/generative-ai', () => {
    return {
        GoogleGenerativeAI: class {
            getGenerativeModel() {
                return {
                    generateContent: vi.fn().mockResolvedValue({
                        response: {
                            text: () => JSON.stringify({
                                category: 'functional',
                                severity: 'high',
                                confidence: { category: 0.9, severity: 0.85 },
                                reasoning: 'Test reasoning',
                                explanation: 'Test explanation'
                            })
                        }
                    })
                }
            }
        }
    }
})

// 2. Now import the engine
import { geminiEngine } from './gemini'

describe('GeminiEngine', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.GEMINI_API_KEY = 'test_key'
    })

    describe('predictBugMetadata', () => {
        it('should return predicted category and severity with confidence', async () => {
            const result = await geminiEngine.predictBugMetadata('Crash on payment', 'App closes when user clicks pay')

            expect(result).toBeDefined()
            expect(result.category).toBe('functional')
            expect(result.severity).toBe('high')
            expect(result.confidence.category).toBe(0.9)
        })
    })

    describe('analyzeBug', () => {
        it('should return a diagnostic diagnosis', async () => {
            const result = await geminiEngine.analyzeBug('App freezes', 'ui_ux', 'medium')
            expect(result).toBeDefined()
        })
    })

    describe('generateDuplicateReasoning', () => {
        it('should provide a concise explanation for duplicates', async () => {
            const result = await geminiEngine.generateDuplicateReasoning('bug a', 'bug b')
            expect(result).toBeDefined()
            expect(typeof result).toBe('string')
        })
    })
})
