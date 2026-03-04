import { BugCategory, BugSeverity } from '@/types/database';

export interface TrainingExample {
    id: string;
    title: string;
    description: string;
    category: BugCategory;
    severity: BugSeverity;
    root_cause: string;
    resolution_steps: string[];
    fix_snippet?: string;
    tags: string[];
}

export const TRAINING_DATASET: TrainingExample[] = [
    {
        id: 'train-001',
        title: 'Authentication Middleware Loop',
        description: 'User gets stuck in a redirect loop between /login and /dashboard even after successful login.',
        category: 'security',
        severity: 'critical',
        root_cause: 'Middleware incorrectly checks for session persistence or cookie expiration handling in Next.js/Supabase integration.',
        resolution_steps: [
            'Check `middleware.ts` for redundant redirect logic.',
            'Ensure `supabase.auth.getSession()` is awaited correctly.',
            'Verify that the `PKCE` flow is properly configured in the Supabase client.'
        ],
        fix_snippet: 'export async function middleware(req: NextRequest) {\n  const res = NextResponse.next();\n  const supabase = createMiddlewareClient({ req, res });\n  await supabase.auth.getSession();\n  return res;\n}',
        tags: ['auth', 'middleware', 'redirect-loop']
    },
    {
        id: 'train-002',
        title: 'Hydration Mismatch in Dashboard',
        description: 'Text content does not match between server and client rendering in StatCards.',
        category: 'ui_ux',
        severity: 'medium',
        root_cause: 'Using dynamic data (like relative dates) directly in the component without suppressing hydration warnings or using `useEffect`.',
        resolution_steps: [
            'Use a `mounted` state with `useEffect` to ensure client-only rendering for dynamic content.',
            'Use `suppressHydrationWarning` on the affected element if the mismatch is intentional.',
            'Ensure date formatting is consistent between server and client timezones.'
        ],
        fix_snippet: 'const [mounted, setMounted] = useState(false);\nuseEffect(() => setMounted(true), []);\nif (!mounted) return null;',
        tags: ['hydration', 'react', 'nextjs']
    },
    {
        id: 'train-003',
        title: 'Slow Vector Search Query',
        description: 'Similarity search for duplicate bugs takes > 5 seconds on 10k records.',
        category: 'performance',
        severity: 'high',
        root_cause: 'Missing `ivfflat` or `hnsw` index on the embedding column in Postgres.',
        resolution_steps: [
            'Identify the current number of lists (lists = rows/1000).',
            'Create an IVFFlat index with `vector_cosine_ops`.',
            'Consider switching to HNSW for better recall/performance trade-off.'
        ],
        fix_snippet: 'CREATE INDEX ON bugs USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);',
        tags: ['database', 'vector', 'performance', 'pgvector']
    },
    {
        id: 'train-004',
        title: 'Uncaught "match_bugs" RPC Error',
        description: 'Frontend crashes when searching for duplicates if no projects exist.',
        category: 'functional',
        severity: 'high',
        root_cause: 'The `match_bugs` RPC function returns null or errors when the `bugs` table is empty instead of an empty array.',
        resolution_steps: [
            'Add a check for `data` nullability in `duplicates.ts`.',
            'Update the SQL function to return an empty set explicitly.',
            'Add error boundary around the AI detection service.'
        ],
        fix_snippet: 'const { data, error } = await supabase.rpc(\'match_bugs\', { ... });\nif (error) return [];\nreturn data || [];',
        tags: ['bug', 'crash', 'rpc', 'supabase']
    },
    {
        id: 'train-1772604878363',
        title: 'Memory Leak in Chart.js',
        description: 'Dashboard crashes after 10 minutes of usage due to excessive memory consumption by analytics charts.',
        category: 'performance',
        severity: 'high',
        root_cause: 'Chart instances are not being destroyed on component unmount.',
        resolution_steps: ["Add cleanup function in useEffect", "call chart.destroy()", "use a ref for chart instance"],
        tags: ["memory", "leak", "in"]
    },
    {
        id: 'train-1772605269696',
        title: 'Verification Bug',
        description: 'Testing the fix',
        category: 'ui',
        severity: 'low',
        root_cause: 'Testing',
        resolution_steps: ["Step 1","Step 2"],
        tags: ["verification","bug"]
    },
];

export class DatasetProvider {
    static getExamplesByCategory(category: BugCategory): TrainingExample[] {
        return TRAINING_DATASET.filter(ex => ex.category === category);
    }

    static getRelatedExamples(text: string): TrainingExample[] {
        const lowerText = text.toLowerCase();
        return TRAINING_DATASET.filter(ex =>
            ex.tags.some(tag => lowerText.includes(tag)) ||
            ex.title.toLowerCase().includes(lowerText) ||
            lowerText.includes(ex.category)
        ).slice(0, 2);
    }

    static getAllTags(): string[] {
        const tags = new Set<string>();
        TRAINING_DATASET.forEach(ex => ex.tags.forEach(t => tags.add(t)));
        return Array.from(tags);
    }
}
