import { pipeline, env } from '@xenova/transformers';

// Configure transformers for serverless/local environment
env.allowLocalModels = false;
env.useBrowserCache = false;

export type NLPResult = {
    embedding: number[];
    entities: { text: string; label: string }[];
    keywords: string[];
};

export type SolutionResult = {
    steps: string[];
    fix_snippet?: string;
    root_cause: string;
    confidence: number;
};

class NLPEngine {
    private embedder: any = null;
    private extractor: any = null;

    private async init() {
        if (!this.embedder) {
            this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        }
        // For entity extraction, we can use a NER pipeline or custom logic
        // But Xenova/bert-base-NER might be too heavy for a quick demo.
        // Let's start with embeddings and keyword extraction for now.
    }

    async analyzeBug(text: string): Promise<NLPResult> {
        await this.init();

        // 1. Generate Embedding
        const output = await this.embedder(text, {
            pooling: 'mean',
            normalize: true
        });
        const embedding = Array.from(output.data) as number[];

        // 2. Simple Entity Extraction (Mock for now or regex based)
        const entities = this.extractEntities(text);

        // 3. Keyword Extraction
        const keywords = this.extractKeywords(text);

        return {
            embedding,
            entities,
            keywords
        };
    }

    private extractEntities(text: string) {
        // Regex for potential components/error codes
        const components = ['UI', 'Backend', 'Database', 'Mobile', 'API', 'Auth', 'Payment'];
        const found: { text: string; label: string }[] = [];

        components.forEach(comp => {
            if (text.toLowerCase().includes(comp.toLowerCase())) {
                found.push({ text: comp, label: 'COMPONENT' });
            }
        });

        // Error codes
        const errorCodeMatch = text.match(/404|500|403|401/g);
        if (errorCodeMatch) {
            errorCodeMatch.forEach(code => {
                found.push({ text: code, label: 'ERROR_CODE' });
            });
        }

        return found;
    }

    private extractKeywords(text: string) {
        // Robust Keyword Extraction (Inspired by RAKE - Rapid Automatic Keyword Extraction)
        // 1. Define stop words and split text into candidate phrases
        const stopwords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'this', 'that', 'it', 'to', 'for', 'with', 'and', 'was', 'were', 'had', 'has', 'in', 'out', 'by', 'be', 'an', 'as']);

        // Split by punctuation and stop words to get candidate phrases
        const phrases = text.toLowerCase()
            .split(/[.,\/#!$%\^&\*;:{}=\-_`~()]/)
            .map(p => p.trim())
            .filter(p => p.length > 0)
            .flatMap(p => p.split(/\s+/).reduce((acc: string[][], word) => {
                if (stopwords.has(word)) {
                    acc.push([]);
                } else {
                    acc[acc.length - 1].push(word);
                }
                return acc;
            }, [[]]))
            .map(p => p.join(' '))
            .filter(p => p.length > 3);

        // 2. Calculate word frequencies and degrees
        const wordFreq: Record<string, number> = {};
        const wordDegree: Record<string, number> = {};

        phrases.forEach(phrase => {
            const words = phrase.split(' ');
            const degree = words.length - 1;
            words.forEach(word => {
                wordFreq[word] = (wordFreq[word] || 0) + 1;
                wordDegree[word] = (wordDegree[word] || 0) + degree;
            });
        });

        // 3. Calculate scores for words (degree/frequency)
        const wordScores: Record<string, number> = {};
        Object.keys(wordFreq).forEach(word => {
            wordScores[word] = (wordDegree[word] + wordFreq[word]) / wordFreq[word];
        });

        // 4. Calculate scores for candidate phrases
        const phraseScores = phrases.map(phrase => {
            const score = phrase.split(' ').reduce((sum, word) => sum + wordScores[word], 0);
            return { phrase, score };
        });

        // 5. Sort and return unique top 5 phrases
        const sorted = phraseScores
            .sort((a, b) => b.score - a.score)
            .map(p => p.phrase);

        return Array.from(new Set(sorted)).slice(0, 5);
    }

    async solveBug(text: string): Promise<SolutionResult> {
        const text_lower = text.toLowerCase();

        // Logic for "rectifying" bugs using component-based templates
        if (text_lower.includes('auth') || text_lower.includes('login') || text_lower.includes('401') || text_lower.includes('403')) {
            return {
                root_cause: "Potential Authentication or Authorization failure. This often occurs when JWT tokens are missing, expired, or middleware policies are incorrectly configured.",
                steps: [
                    "Verify the Supabase session token in browser storage.",
                    "Check the `middleware.ts` to ensure the route isn't being blocked.",
                    "Review Row Level Security (RLS) policies for the affected table.",
                    "Validate that the service role key isn't being used in the client-side."
                ],
                fix_snippet: "const { data: { session } } = await supabase.auth.getSession();\nif (!session) router.push('/login');",
                confidence: 0.88
            };
        }

        if (text_lower.includes('ui') || text_lower.includes('css') || text_lower.includes('layout') || text_lower.includes('responsive')) {
            return {
                root_cause: "UI Rendering or Styling mismatch. Likely caused by hydration errors or incorrect Tailwind CSS utility classes.",
                steps: [
                    "Check for 'Hydration failed' warnings in the browser console.",
                    "Verify that server-side and client-side rendered content matches.",
                    "Inspect the element with DevTools to check for layout shifts.",
                    "Ensure Tailwind classes are correctly purged in the tailwind.config.js."
                ],
                fix_snippet: "<div className=\"hidden md:flex flex-col gap-4\">\n  {/* Your content */}\n</div>",
                confidence: 0.82
            };
        }

        if (text_lower.includes('database') || text_lower.includes('sql') || text_lower.includes('query') || text_lower.includes('postgres')) {
            return {
                root_cause: "Database query error or schema mismatch. Could be an invalid join, missing index, or RLS blocking the request.",
                steps: [
                    "Run the query directly in the Supabase SQL Editor.",
                    "Check if the `pgvector` extension is enabled if using AI features.",
                    "Verify foreign key relationships in `supabase/schema.sql`.",
                    "Add an index to the columns frequently used in WHERE filters."
                ],
                fix_snippet: "CREATE INDEX ON projects USING ivfflat (embedding vector_cosine_ops);\n-- For pgvector performance",
                confidence: 0.85
            };
        }

        // Generic fallback
        return {
            root_cause: "Insufficient patterns detected for a specific diagnosis. Analyzing general symptoms...",
            steps: [
                "Examine the browser console and server logs for error tracebacks.",
                "Check for recent changes in the codebase related to this module.",
                "Verify network requests in the 'Network' tab of DevTools.",
                "Review project dependencies for potential version conflicts."
            ],
            confidence: 0.65
        };
    }
}

export const nlpEngine = new NLPEngine();
