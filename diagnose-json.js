const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

async function diagnoseKey() {
    const apiKey = "AIzaSyDd9FLROYWuveChThGe2x91PkqbxvEAJto";
    const report = { key: apiKey.substring(0, 10) + "...", tests: [] };

    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Test");
            const response = await result.response;
            report.tests.push({ model: modelName, status: "SUCCESS", response: response.text() });
        } catch (error) {
            report.tests.push({
                model: modelName,
                status: "FAILED",
                message: error.message,
                httpStatus: error.response ? error.response.status : "unknown"
            });
        }
    }

    fs.writeFileSync('diag-report.json', JSON.stringify(report, null, 2));
}

diagnoseKey();
