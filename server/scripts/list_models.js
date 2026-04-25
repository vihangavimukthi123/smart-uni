const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using API Key ending in:", key ? key.substring(key.length - 4) : "NONE");
    if (!key) return;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
             console.log("AVAILABLE MODELS:");
             data.models.forEach(m => console.log(` - ${m.name}`));
        } else {
             console.log("No models field in response:", JSON.stringify(data));
        }
    } catch (err) {
        console.error("List Models Error:", err);
    }
}

listModels();
