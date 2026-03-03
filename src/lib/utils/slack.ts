/**
 * Slack Webhook Utility
 * Handles sending messages to Slack channels via Incoming Webhooks.
 */

export interface SlackMessage {
    text: string;
    blocks?: any[];
}

export async function sendSlackAlert(webhookUrl: string, message: SlackMessage) {
    if (!webhookUrl) return { success: false, error: 'No webhook URL provided' };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Slack API error: ${response.status} ${errorText}`);
        }

        return { success: true };
    } catch (error) {
        console.error('Error sending Slack alert:', error);
        return { success: false, error };
    }
}

/**
 * Formats a bug report for Slack with rich formatting
 */
export function formatBugSlackMessage(bug: {
    id: string;
    title: string;
    severity: string;
    category: string;
    project_name: string;
    reporter: string;
}, baseUrl: string) {
    const severityEmoji: Record<string, string> = {
        critical: '🚨 *CRITICAL*',
        high: '🟠 *HIGH*',
        medium: '🟡 *MEDIUM*',
        low: '⚪ *LOW*'
    };

    const emoji = severityEmoji[bug.severity] || bug.severity;

    const bugUrl = `${baseUrl}/dashboard/manager/bugs/${bug.id}`;

    return {
        text: `New ${bug.severity} bug reported in ${bug.project_name}`,
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: "🐞 New Bug Reported",
                    emoji: true
                }
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Project:*\n${bug.project_name}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Severity:*\n${emoji}`
                    }
                ]
            },
            {
                type: "section",
                fields: [
                    {
                        type: "mrkdwn",
                        text: `*Category:*\n${bug.category.replace('_', ' ').toUpperCase()}`
                    },
                    {
                        type: "mrkdwn",
                        text: `*Reporter:*\n${bug.reporter}`
                    }
                ]
            },
            {
                type: "section",
                text: {
                    type: "mrkdwn",
                    text: `*Title:*\n${bug.title}`
                }
            },
            {
                type: "actions",
                elements: [
                    {
                        type: "button",
                        text: {
                            type: "plain_text",
                            text: "View Bug Details",
                            emoji: true
                        },
                        url: bugUrl,
                        style: bug.severity === 'critical' ? 'danger' : 'primary'
                    }
                ]
            }
        ]
    };
}
