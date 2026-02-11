const OpenAI = require("openai");

async function testOpenRouter() {
    const apiKey = "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";

    console.log("🚀 Testing OpenRouter Connection...");

    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey,
        defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Bug Management Platform Test",
        }
    });

    try {
        console.log("Sending request to google/gemini-2.0-flash-001...");
        const completion = await openai.chat.completions.create({
            model: "google/gemini-2.0-flash-001",
            messages: [
                { role: "user", content: "Hello! Confirm you are working via OpenRouter." }
            ]
        });

        console.log("✅ SUCCESS!");
        console.log("Response:", completion.choices[0].message.content);
    } catch (error) {
        console.log("❌ FAILED:", error.message);
        if (error.response) {
            console.log("Status:", error.status);
        }
    }
}

testOpenRouter();
