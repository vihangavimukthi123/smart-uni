
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testQuota() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("NO API KEY FOUND");
        return;
    }

    console.log("Testing with key ending in:", key.substring(key.length - 4));

    try {
        const genAI = new GoogleGenerativeAI(key);
        // Test with the latest flash alias
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = "Hi";
        const result = await model.generateContent(prompt);
        console.log("GENERAION SUCCESS:", result.response.text());
    } catch (err) {
        console.log("\n--- QUOTA ERROR DETECTED ---");
        console.log("Status:", err.status);
        console.log("Message:", err.message);
        if (err.response) {
            console.log("Response JSON:", JSON.stringify(err.response, null, 2));
        }
        
        if (err.message && err.message.includes("Quota exceeded")) {
             if (err.message.includes("per minute")) {
                 console.log("SUGGESTION: You are hitting the Minute limit. Wait 60 seconds.");
             } else if (err.message.includes("per day")) {
                 console.log("SUGGESTION: You have reached the DAILY limit. You must wait until tomorrow or use a different API key.");
             }
        }
    }
}

testQuota();
