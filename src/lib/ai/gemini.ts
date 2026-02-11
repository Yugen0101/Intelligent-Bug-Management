import OpenAI from 'openai';

export type GeminiAnalysis = {
    root_cause: string;
    steps: string[];
    fix_snippet?: string;
    confidence: number;
};

export type GeminiPrediction = {
    category: string;
    severity: string;
    confidence: {
        category: number;
        severity: number;
    };
    explanation: string;
};

export type ProjectHealthInsight = {
    summary: string;
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
    anomalies: string[];
};

export class GeminiEngine {
    private openai: OpenAI | null = null;
    // Using Google's Gemini 2.0 Flash via OpenRouter
    private modelName = "google/gemini-2.0-flash-001";

    private initClient() {
        const apiKey = (process.env.OPENROUTER_API_KEY || "").trim();
        if (!apiKey || apiKey === 'your_openrouter_key_here') {
            throw new Error("OPENROUTER_NOT_CONFIGURED");
        }

        if (!this.openai) {
            this.openai = new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: apiKey,
                defaultHeaders: {
                    "HTTP-Referer": "http://localhost:3000", // Required for OpenRouter
                    "X-Title": "Bug Management Platform", // Optional
                }
            });
        }
        return this.openai;
    }

    private async retryOperation<T>(operation: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            // Check for rate limiting (429) or overloaded model (503) from OpenRouter
            if (retries > 0 && (error.status === 429 || error.status === 503 || error.message?.includes('429') || error.message?.includes('503'))) {
                console.log(`OpenRouter rate/load limit. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.retryOperation(operation, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    async analyzeBug(description: string, category: string, severity: string): Promise<GeminiAnalysis> {
        const client = this.initClient();

        const prompt = `
            You are an expert software engineer and bug triage assistant. 
            Analyze the following bug report and provide a diagnostic report.
            
            Bug Description: "${description}"
            Category: ${category}
            Severity: ${severity}
            
            Provide your response in strict JSON format with the following keys:
            - root_cause: A concise explanation of why this bug is likely occurring.
            - steps: An array of 3-4 specific technical steps a developer should take to fix this.
            - fix_snippet: A short code snippet (if applicable) demonstrating the fix. Use Markdown formatting inside the string.
            - confidence: A number between 0 and 1 indicating your confidence in this diagnosis.
            
            JSON Response:
        `;

        try {
            const completion = await this.retryOperation(() => client.chat.completions.create({
                model: this.modelName,
                messages: [{ role: "user", content: prompt }]
            }));

            const text = completion.choices[0]?.message?.content || "{}";

            // Extract JSON if model wraps it in markdown backticks
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) {
                    console.error("Failed to parse matched JSON:", jsonMatch[0]);
                }
            }

            return JSON.parse(text);
        } catch (error: any) {
            console.error("OpenRouter API Error:", error);

            if (error.message === "OPENROUTER_NOT_CONFIGURED") {
                throw error;
            }

            // Handle 401 or invalid API key errors
            if (error.status === 401 || error.message?.includes('401')) {
                throw new Error("INVALID_API_KEY");
            }

            throw error;
        }
    }

    async predictBugMetadata(title: string, description: string): Promise<GeminiPrediction> {
        const client = this.initClient();

        const prompt = `
            You are a senior bug triage specialist. Based on the following bug report, predict the most appropriate category and severity.
            
            Title: "${title}"
            Description: "${description}"
            
            Valid Categories: ui_ux, functional, performance, security, data_logic, integration
            Valid Severities: critical, high, medium, low
            
            Provide your response in strict JSON format:
            {
                "category": "one of the valid categories",
                "severity": "one of the valid severities",
                "confidence": {
                    "category": 0.0 to 1.0,
                    "severity": 0.0 to 1.0
                },
                "explanation": "A short sentence explaining why you chose these."
            }
        `;

        try {
            const completion = await this.retryOperation(() => client.chat.completions.create({
                model: this.modelName,
                messages: [{ role: "user", content: prompt }]
            }));

            const text = completion.choices[0]?.message?.content || "{}";

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) { }
            }

            return JSON.parse(text);
        } catch (error) {
            console.error("OpenRouter Prediction Error:", error);
            throw error;
        }
    }

    async getAgentResponse(message: string, context: { description: string, comments: any[] }): Promise<string> {
        try {
            const client = this.initClient();

            const prompt = `
                You are an AI Triage Agent for a bug management platform. 
                The user (a developer) is asking: "${message}"
                
                Context of the bug being discussed:
                Description: "${context.description}"
                Recent comments: ${JSON.stringify(context.comments.slice(-5))}
                
                Provide a helpful, professional, and technical response to guide the developer. 
                Keep it focused on the specific bug context.
            `;

            const completion = await this.retryOperation(() => client.chat.completions.create({
                model: this.modelName,
                messages: [{ role: "user", content: prompt }]
            }));

            return completion.choices[0]?.message?.content || "I couldn't generate a response.";
        } catch (error: any) {
            console.error("OpenRouter Agent Error:", error);

            // Handle specific error types
            if (error.message === "OPENROUTER_NOT_CONFIGURED") {
                return "⚠️ **AI Service Not Configured**\n\nThe OpenRouter API key is missing. Please add a valid `OPENROUTER_API_KEY` to your `.env.local` file.\n\n**Get your key:**\nvisit https://openrouter.ai/keys";
            }

            // Handle 401/403 or invalid API key errors
            if (error.status === 401 || error.status === 403 || error.message?.includes('401')) {
                return "⚠️ **Invalid API Key**\n\nYour OpenRouter API key appears to be invalid or lacks credit.\n\nCheck your key at https://openrouter.ai/keys";
            }

            if (error.status === 402 || error.message?.includes('402')) {
                return "⚠️ **Insufficient Credits**\n\nYour OpenRouter account needs credits. Please top up at https://openrouter.ai/credits";
            }

            return "I apologize, but I'm having trouble connecting to my reasoning engine via OpenRouter. Please check your configuration.";
        }
    }

    async generateProjectHealthInsight(stats: any): Promise<ProjectHealthInsight> {
        const client = this.initClient();

        const prompt = `
            You are a senior project management consultant. Analyze the following bug tracking data and provide an executive summary, recommendations, and risk assessment.
            
            Data Summary:
            - Open Bugs: ${stats.openBugs}
            - Category Distribution: ${JSON.stringify(stats.categories)}
            - Severity Distribution: ${JSON.stringify(stats.severities)}
            - Workload Distribution: ${JSON.stringify(stats.workload)}
            
            Provide your response in strict JSON format:
            {
                "summary": "A concise paragraph (2-3 sentences) summarizing the project health.",
                "recommendations": ["Recommendation 1", "Recommendation 2"],
                "riskLevel": "high/medium/low",
                "anomalies": ["Any unusual patterns detected (e.g. spike in security bugs)"]
            }
        `;

        try {
            const completion = await this.retryOperation(() => client.chat.completions.create({
                model: this.modelName,
                messages: [{ role: "user", content: prompt }]
            }));

            const text = completion.choices[0]?.message?.content || "{}";

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) { }
            }

            return JSON.parse(text);
        } catch (error: any) {
            console.error("OpenRouter Health Insight Error:", error);
            throw error;
        }
    }

    async generateDuplicateReasoning(newBugDesc: string, existingBugDesc: string): Promise<string> {
        try {
            const client = this.initClient();

            const prompt = `
                Compare these two bug descriptions and explain in one concise sentence why they appear to be duplicates. Focus on the core functionality failure or symptoms.
                
                New Bug: ${newBugDesc}
                Existing Bug: ${existingBugDesc}
                
                Response must be a single, professional sentence (max 25 words).
            `;

            const completion = await this.retryOperation(() => client.chat.completions.create({
                model: this.modelName,
                messages: [{ role: "user", content: prompt }]
            }));

            return completion.choices[0]?.message?.content?.trim() || "Matches description.";
        } catch (error: any) {
            console.error("OpenRouter Duplicate Reasoning Error:", error);
            return "These issues share highly similar technical characteristics and symptoms.";
        }
    }
}

export const geminiEngine = new GeminiEngine();
