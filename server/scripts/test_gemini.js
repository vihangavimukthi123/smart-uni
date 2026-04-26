
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("Missing GEMINI_API_KEY");
        return;
    }

    const versions = ['v1', 'v1beta'];
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];

    for (const version of versions) {
        for (const modelName of models) {
            console.log(`Testing ${modelName} with ${version}...`);
            try {
                const genAI = new GoogleGenerativeAI(key);
                const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: version });
                const result = await model.generateContent("Say 'Success' if you can read this.");
                console.log(`✅ Success for ${modelName} on ${version}:`, result.response.text());
                return; // Stop on first success
            } catch (err) {
                console.log(`❌ Failed for ${modelName} on ${version}:`, err.message);
            }
        }
    }
}

testGemini();
