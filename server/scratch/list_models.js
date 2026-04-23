const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../.env' });

async function checkModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  try {
    // In newer SDKs, model listing is done via a different method or we can just fetch
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Using API Key:", apiKey ? "OK" : "MISSING");
    
    // We'll use fetch to hit the models endpoint directly
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
        console.log("AVAILABLE MODELS:");
        data.models.forEach(m => {
            console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods})`);
        });
    } else {
        console.log("Could not list models:", data);
    }
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

checkModels();
