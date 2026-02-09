import { GoogleGenerativeAI } from "@google/generative-ai";

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
    private genAI: any = null;
    private model: any = null;

    private initModel() {
        const apiKey = (process.env.GEMINI_API_KEY || "").trim();
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            throw new Error("Gemini API key not configured");
        }

        if (!this.genAI || !this.model) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        }
        return this.model;
    }

    async analyzeBug(description: string, category: string, severity: string): Promise<GeminiAnalysis> {
        const model = this.initModel();

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
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

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
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    }

    async predictBugMetadata(title: string, description: string): Promise<GeminiPrediction> {
        const model = this.initModel();

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
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) { }
            }

            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Prediction Error:", error);
            throw error;
        }
    }

    async getAgentResponse(message: string, context: { description: string, comments: any[] }): Promise<string> {
        try {
            const model = this.initModel();

            const prompt = `
                You are an AI Triage Agent for a bug management platform. 
                The user (a developer) is asking: "${message}"
                
                Context of the bug being discussed:
                Description: "${context.description}"
                Recent comments: ${JSON.stringify(context.comments.slice(-5))}
                
                Provide a helpful, professional, and technical response to guide the developer. 
                Keep it focused on the specific bug context.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Agent Error:", error);
            return "I apologize, but I'm having trouble connecting to my reasoning engine. Please try again in a moment.";
        }
    }

    async generateProjectHealthInsight(stats: any): Promise<ProjectHealthInsight> {
        const model = this.initModel();

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
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e) { }
            }

            return JSON.parse(text);
        } catch (error) {
            console.error("Gemini Health Insight Error:", error);
            throw error;
        }
    }

    async generateDuplicateReasoning(newBugDesc: string, existingBugDesc: string): Promise<string> {
        try {
            const model = this.initModel();

            const prompt = `
                Compare these two bug descriptions and explain in one concise sentence why they appear to be duplicates. Focus on the core functionality failure or symptoms.
                
                New Bug: ${newBugDesc}
                Existing Bug: ${existingBugDesc}
                
                Response must be a single, professional sentence (max 25 words).
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error("Gemini Duplicate Reasoning Error:", error);
            return "These issues share highly similar technical characteristics and symptoms.";
        }
    }
}

export const geminiEngine = new GeminiEngine();

