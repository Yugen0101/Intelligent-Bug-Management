// Database types matching the Supabase schema

export type UserRole = 'tester' | 'developer' | 'manager'

export type BugCategory =
    | 'ui_ux'
    | 'functional'
    | 'performance'
    | 'security'
    | 'data_logic'
    | 'integration'

export type BugSeverity = 'critical' | 'high' | 'medium' | 'low'

export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'duplicate'

export interface Profile {
    id: string
    full_name: string
    role: UserRole
    avatar_url?: string
    created_at: string
    updated_at: string
}

export interface Project {
    id: string
    name: string
    description?: string
    created_by?: string
    created_at: string
    updated_at: string
}

export interface Bug {
    id: string
    project_id: string
    created_by?: string
    title: string
    description: string
    category?: BugCategory
    severity?: BugSeverity
    status: BugStatus
    embedding?: number[] // Vector embedding for similarity search
    ai_metadata?: AIMetadata
    duplicate_of?: string
    created_at: string
    updated_at: string
    resolved_at?: string
}

export interface AIMetadata {
    category_prediction?: {
        prediction: BugCategory
        confidence: number
        explanation: string
    }
    severity_prediction?: {
        prediction: BugSeverity
        confidence: number
        explanation: string
    }
    extracted_entities?: Array<{
        text: string
        type: string
    }>
    keywords?: string[]
    model_version?: string
}

export interface BugAssignment {
    id: string
    bug_id: string
    assigned_to: string
    assigned_by?: string
    assigned_at: string
}

export interface Comment {
    id: string
    bug_id: string
    user_id?: string
    content: string
    created_at: string
    updated_at: string
}

export interface AIPrediction {
    id: string
    bug_id: string
    model_version: string
    predictions: Record<string, any>
    explanations?: Record<string, any>
    created_at: string
}

// Extended types with relations
export interface BugWithRelations extends Bug {
    created_by_profile?: Profile
    project?: Project
    assignments?: Array<BugAssignment & { assigned_to_profile?: Profile }>
    comments?: Array<Comment & { user_profile?: Profile }>
    duplicate_of_bug?: Bug
}

export interface SimilarBug {
    id: string
    title: string
    description: string
    category?: BugCategory
    severity?: BugSeverity
    status: BugStatus
    similarity: number
}
