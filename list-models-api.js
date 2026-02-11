const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function checkAvailableModels() {
    const apiKey = "AIzaSyDd9FLROYWuveChThGe2x91PkqbxvEAJto"; // New Key
    const genAI = new GoogleGenerativeAI(apiKey);

    // Instead of instantiating the model, we access the model listing capability
    // Note: The SDK exposes this via the 'getGenerativeModel' but for listing we might need to use the lower level API or just try a different approach if SDK doesn't support direct listing easily.
    // Actually, let's just use a simple fetch to the REST API because it's more reliable for debugging raw responses.

    // We'll use the native fetch to call the list models endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const result = {
            status: response.status,
            statusText: response.statusText,
            data: data
        };

        fs.writeFileSync('model-list.json', JSON.stringify(result, null, 2));
    } catch (error) {
        fs.writeFileSync('model-list.json', JSON.stringify({ error: error.message }, null, 2));
    }
}

checkAvailableModels();
