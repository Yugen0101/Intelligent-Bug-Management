// Test to list available models
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const apiKey = "AIzaSyCVxCircpL-orDD9QjnAP2I5nP7v3XgRAA";

    console.log("Attempting to list available Gemini models...");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try different common model names
        const modelsToTry = [
            "gemini-pro",
            "gemini-1.5-pro",
            "gemini-1.5-flash",
            "gemini-1.0-pro"
        ];

        for (const modelName of modelsToTry) {
            console.log(`\nTrying model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Say hi");
                const response = await result.response;
                console.log(`✅ ${modelName} works! Response: ${response.text()}`);
                return modelName;
            } catch (err) {
                console.log(`❌ ${modelName} failed: ${err.message}`);
            }
        }

        console.log("\n⚠️  No models worked. API key might be invalid.");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
