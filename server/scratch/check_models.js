const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '../../.env' });

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There is no direct listModels in the genAI client usually, 
    // it's part of the v1beta API. 
    // We can try to list them via fetch or just guess the stable ones.
    console.log("API Key found:", process.env.GEMINI_API_KEY ? "Yes" : "No");
    
    // Attempting to list models via a direct request if possible or just log common names.
    console.log("Common stable models to try:");
    console.log("- gemini-1.5-flash");
    console.log("- gemini-1.5-flash-latest");
    console.log("- gemini-1.5-pro");
    console.log("- gemini-pro");
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
