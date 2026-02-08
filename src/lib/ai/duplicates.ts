import { createClient } from '@/lib/supabase/client';
import { nlpEngine } from '@/lib/nlp/engine';
import { geminiEngine } from './gemini';

export type DuplicateResult = {
    id: string;
    title: string;
    description: string;
    category: string;
    severity: string;
    status: string;
    similarity: number;
    reasoning?: string;
};

export class DuplicateDetectionService {
    private supabase = createClient();

    async findDuplicates(description: string, projectId?: string, threshold: number = 0.82): Promise<DuplicateResult[]> {
        try {
            // 1. Generate embedding for the new bug description
            const { embedding } = await nlpEngine.analyzeBug(description);

            // 2. Call the RPC function to find similar bugs
            const { data, error } = await this.supabase.rpc('match_bugs', {
                query_embedding: embedding,
                match_threshold: threshold,
                match_count: 3,
                project_filter: projectId
            });

            if (error) throw error;

            const results = data as DuplicateResult[];

            // 3. Optional: Add semantic reasoning for the top matches using Gemini
            if (results.length > 0) {
                const resultsWithReasoning = await Promise.all(results.map(async (res) => {
                    try {
                        const reasoning = await geminiEngine.generateDuplicateReasoning(description, res.description);
                        return { ...res, reasoning };
                    } catch (err) {
                        return res;
                    }
                }));
                return resultsWithReasoning;
            }

            return results;
        } catch (error) {
            console.error('Duplicate Detection Error:', error);
            return [];
        }
    }
}

export const duplicateService = new DuplicateDetectionService();
