
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testGemini2() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return;

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const prompt = "Say 'Success'";
        const result = await model.generateContent(prompt);
        console.log("Success:", result.response.text());
    } catch (err) {
        console.error("Error Status:", err.status);
        console.error("Error Message:", err.message);
        console.error("Error Struct:", JSON.stringify(err, null, 2));
    }
}

testGemini2();
