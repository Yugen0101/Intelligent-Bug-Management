import { createClient } from '@/lib/supabase/client'

export type NotificationType = 'assignment' | 'comment' | 'status_update'

interface SendNotificationParams {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    projectId?: string
    bugDetails?: {
        id: string
        title: string
        severity: string
        category: string
        reporter_name: string
    }
}

export async function sendNotification({
    userId,
    type,
    title,
    message,
    link,
    projectId,
    bugDetails
}: SendNotificationParams) {
    const supabase = createClient()

    try {
        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                link
            })

        if (error) throw error

        // --- New: Slack Integration Logic ---
        if (projectId && bugDetails && (bugDetails.severity === 'high' || bugDetails.severity === 'critical')) {
            const { data: project } = await supabase
                .from('projects')
                .select('name, slack_webhook_url, slack_notifications_enabled')
                .eq('id', projectId)
                .single();

            if (project?.slack_notifications_enabled && project?.slack_webhook_url) {
                const { sendSlackAlert, formatBugSlackMessage } = await import('./slack');
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

                const slackMsg = formatBugSlackMessage({
                    id: bugDetails.id,
                    title: bugDetails.title,
                    severity: bugDetails.severity,
                    category: bugDetails.category,
                    project_name: project.name,
                    reporter: bugDetails.reporter_name
                }, baseUrl);

                await sendSlackAlert(project.slack_webhook_url, slackMsg);
            }
        }
        // ------------------------------------

        return { success: true }
    } catch (err) {
        console.error('Error sending notification:', err)
        return { success: false, error: err }
    }
}
