const { GoogleGenerativeAI } = require("@google/generative-ai");
const workplan = require('../models/workPlan'); // Oyage model eka

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. Generate Work Plan ---
exports.generateWorkplan = async (req, res, next) => {
    try {
        console.log("Generating workplan for user:", req.body.userId);
        const { availability, tasks, focusInterval, bedtime, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const prompt = `Act as a professional Academic Success Strategist. Generate a highly detailed, momentum-building study workplan based on the following student data:

        INPUT DATA:
        1. Tasks & Deadlines: ${JSON.stringify(tasks)}
        2. Daily Availability: ${availability}
        3. Deep Work Interval: ${focusInterval}
        4. Sleep Schedule (Bedtime): ${bedtime}

        STRICT OUTPUT REQUIREMENT:
        Return ONLY a valid JSON object. No conversational text, no markdown code blocks.

        JSON STRUCTURE:
        {
          "summary": {
            "scope_title": "Total Study Sessions",
            "scope_value": "e.g., 18 Sessions",
            "effort_title": "Total Estimated Effort",
            "effort_value": "e.g., 14.5 Hours",
            "target_completion": "Date by which all tasks will be done"
          },
          "calendar_map": [
            { "date": "YYYY-MM-DD", "intensity": "High/Medium/Low", "main_focus": "Task Name" }
          ],
          "detailed_plan": [
            {
              "day_name": "Monday, Nov 18",
              "formatted_date": "2026-04-21",
              "daily_goal": "Goal for the day",
              "time_slots": [
                {
                  "start_time": "6:00 PM",
                  "end_time": "6:45 PM",
                  "task_title": "Database ER Diagram",
                  "priority": "High",
                  "action_step": "Specific small action to take during this block"
                }
              ]
            }
          ],
          "academic_tips": [
            "Tip 1: Based on focus interval",
            "Tip 2: Based on task deadlines"
          ]
        }

        INSTRUCTIONS:
        1. Break down large projects into small, manageable 45-60 min blocks.
        2. Prioritize tasks strictly by deadline proximity.
        3. Ensure the schedule is realistic and ends 15 minutes before the specified bedtime.
        4. If there are multiple tasks, interleave them to avoid burnout.`;

        const modelsToTry = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.0-flash"];
        let result = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Attempting generation with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                result = await model.generateContent(prompt);
                if (result) break; // Success!
            } catch (err) {
                console.warn(`Model ${modelName} failed:`, err.message);
                lastError = err;
                // Continue to next model if 429 (quota), 503 (high load), or 404 (not found)
                if (!err.message.includes("429") && !err.message.includes("503") && !err.message.includes("404")) {
                    throw err; // Re-throw if it's a structural error
                }
            }
        }

        if (!result) {
            throw new Error(`All AI models are currently at capacity. Please try again in a few minutes. (Last error: ${lastError?.message})`);
        }
        const responseText = result.response.text();
        console.log("Raw Gemini Response:", responseText);

        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        
        if (firstBrace === -1 || lastBrace === -1) {
            throw new Error("AI failed to return valid JSON");
        }

        const jsonString = responseText.substring(firstBrace, lastBrace + 1);
        const cleanJson = JSON.parse(jsonString);

        // Save the plan
        const newPlan = new workplan({
            userId,
            workplan: cleanJson
        });
        await newPlan.save();
        console.log("Workplan saved successfully:", newPlan._id);

        res.status(200).json({ success: true, data: newPlan });
    } catch (error) {
        console.error("Gemini Error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message || "An error occurred during generation" 
        });
    }
};

// --- 2. Get all saved plans (Academic Vault page) ---
exports.getAllPlans = async (req, res, next) => {
    try {
        const plans = await workplan.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
};

// --- 2.1 Get single plan ---
exports.getSinglePlan = async (req, res, next) => {
    try {
        const plan = await workplan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        next(error);
    }
};

// --- 3. Update plan ---
exports.updatePlan = async (req, res, next) => {
    try {
        const updatedPlan = await workplan.findByIdAndUpdate(
            req.params.id,
            { workplan: req.body.workplan },
            { new: true, runValidators: true }
        );
        if (!updatedPlan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
        res.status(200).json({ success: true, data: updatedPlan });
    } catch (error) {
        next(error);
    }
};

// --- 4. Delete plan ---
exports.deletePlan = async (req, res, next) => {
    try {
        const plan = await workplan.findByIdAndDelete(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }
        res.status(200).json({ success: true, message: "Plan deleted successfully" });
    } catch (error) {
        next(error);
    }
};