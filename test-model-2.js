const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testNewModel() {
    const apiKey = "AIzaSyDd9FLROYWuveChThGe2x91PkqbxvEAJto";
    const genAI = new GoogleGenerativeAI(apiKey);

    // Using a model CONFIRMED to be in the list
    const modelName = "gemini-2.0-flash";

    console.log(`Testing model: ${modelName}...`);

    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`✅ SUCCESS! ${modelName} is working.`);
        console.log(`Response: ${response.text()}`);
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`);
    }
}

testNewModel();
