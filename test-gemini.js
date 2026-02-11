// Quick test to verify Gemini API key validity
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiConnection() {
    const apiKey = "AIzaSyCVxCircpL-orDD9QjnAP2I5nP7v3XgRAA";

    console.log("Testing Gemini API connection...");
    console.log(`API Key (first 10 chars): ${apiKey.substring(0, 10)}...`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("Model initialized successfully");

        const prompt = "Say 'Hello, I'm working!' in one sentence.";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("\n✅ SUCCESS! API is working.");
        console.log("Response:", text);
        return true;
    } catch (error) {
        console.error("\n❌ ERROR:", error.message);
        console.error("\nFull error:", error);
        return false;
    }
}

testGeminiConnection();
