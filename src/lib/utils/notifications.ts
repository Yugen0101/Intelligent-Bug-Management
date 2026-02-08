import { createClient } from '@/lib/supabase/client'

export type NotificationType = 'assignment' | 'comment' | 'status_update'

interface SendNotificationParams {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
}

export async function sendNotification({
    userId,
    type,
    title,
    message,
    link
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
        return { success: true }
    } catch (err) {
        console.error('Error sending notification:', err)
        return { success: false, error: err }
    }
}
