require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK doesn't always have a direct listModels, we might need a raw fetch or use the internal client
        // but for now let's just try basic models
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-2.0-flash'];
        
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("hello");
                console.log(`✅ Model ${m} is available`);
            } catch (e) {
                console.log(`❌ Model ${m} is NOT available: ${e.message}`);
            }
        }
    } catch (err) {
        console.error("General error:", err);
    }
}

listModels();
