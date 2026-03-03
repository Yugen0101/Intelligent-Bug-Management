import { GeminiEngine } from './gemini';
import { BugWithRelations } from '@/types/database';

export interface PriorityRecommendation {
    bug_id: string;
    score: number; // 0 to 100
    reasoning: string;
    suggested_action: string;
}

export class AIPriorityService {
    private gemini: GeminiEngine;

    constructor() {
        this.gemini = new GeminiEngine();
    }

    /**
     * Ranks a list of bugs to suggest which ones should be fixed first.
     */
    async rankBugs(bugs: BugWithRelations[]): Promise<PriorityRecommendation[]> {
        if (bugs.length === 0) return [];

        const bugData = bugs.map(b => ({
            id: b.id,
            title: b.title,
            severity: b.severity,
            category: b.category,
            status: b.status,
            created_at: b.created_at,
            assignment_count: b.assignments?.length || 0
        }));

        const prompt = `
            You are a Technical Project Manager. Rank these bug reports by priority (0-100 score).
            Consider:
            1. Severity (Critical/High > Medium > Low)
            2. Impact (Security/Functional > UI/UX)
            3. Age (Older bugs might need attention if they are high severity)
            
            Bugs:
            ${JSON.stringify(bugData, null, 2)}
            
            Return a JSON array of PriorityRecommendation:
            [
                { "bug_id": "...", "score": 95, "reasoning": "...", "suggested_action": "Assign to senior dev immediately" }
            ]
            Sort by score descending.
        `;

        try {
            const client = (this.gemini as any).initClient();
            const completion = await client.chat.completions.create({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    { role: "system", content: "You are a prioritization expert. Output only valid JSON." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });

            const text = completion.choices[0]?.message?.content || "[]";
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            const rawJson = JSON.parse(text);
            return Array.isArray(rawJson) ? rawJson : (rawJson.recommendations || []);
        } catch (error) {
            console.error("AI Priority Error:", error);
            // Fallback: simple heuristic ranking if AI fails
            return bugs.map(b => ({
                bug_id: b.id,
                score: b.severity === 'critical' ? 90 : b.severity === 'high' ? 70 : 40,
                reasoning: "Heuristic fallback ranking.",
                suggested_action: "Review manually."
            })).sort((a, b) => b.score - a.score);
        }
    }
}
