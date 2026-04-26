
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Model Names:");
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error in response", data);
        }
    } catch (err) {
        console.error("List Models Error:", err);
    }
}

listModels();
