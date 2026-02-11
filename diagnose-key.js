const { GoogleGenerativeAI } = require("@google/generative-ai");

async function diagnoseKey() {
    // This is the NEW key the user provided
    const apiKey = "AIzaSyDd9FLROYWuveChThGe2x91PkqbxvEAJto";

    console.log(`🔍 Diagnosing API Key: ${apiKey.substring(0, 10)}...`);

    const genAI = new GoogleGenerativeAI(apiKey);

    // List of models to try, in order of likelihood to work
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];

    let success = false;

    for (const modelName of models) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test connection");
            const response = await result.response;
            console.log(`✅ SUCCESS! Model '${modelName}' is working.`);
            success = true;
            break; // Stop after first success
        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Status Text: ${error.response.statusText}`);
            }
        }
    }

    if (!success) {
        console.log("\n⚠️  ALL models failed. The API key appears to be invalid or has no quota.");
    } else {
        console.log("\n🎉 At least one model works! Update your code to use the working model.");
    }
}

diagnoseKey();
