const mongoose = require('mongoose');
const WorkPlan = require('../models/workPlan');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Clean Slate Workplan Generator
 * Focus: Stability, Accuracy, and Reliability
 */
exports.generateWorkplan = async (req, res, next) => {
    try {
        const { availability, tasks, studyInterval, userId, lifeEvents } = req.body;

        // 1. Validation
        if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });
        
        // 2. Clear, simple instructions for the AI
        const prompt = `You are an Academic Success Coach. Generate a JSON workplan.
        START DATE: ${new Date().toISOString().split('T')[0]}
        TASKS: ${JSON.stringify(tasks)}
        STUDY WINDOW: ${availability}
        LIFE EVENTS: ${JSON.stringify(lifeEvents)}
        STYLE: ${studyInterval}

        REQUIREMENTS:
        - Generate a plan for every day until the last deadline.
        - Output ONLY a JSON object with this exact structure:
        {
          "summary": { "scope_value": "Total task count", "effort_value": "Total hours", "target_completion": "Final date" },
          "detailed_plan": [
            {
              "day_name": "Day Name",
              "formatted_date": "YYYY-MM-DD",
              "daily_goal": "Goal for the day",
              "time_slots": [
                { "start_time": "7:00 PM", "end_time": "8:30 PM", "task_title": "Task Name", "action_step": "Specific goal" }
              ]
            }
          ],
          "academic_tips": ["Practical study tip"]
        }
        Do not include extra text. Only JSON.`;

        console.log("Starting Clean-Slate Generation...");
        
        // 3. Connect to the most stable model for this account (2.0 is the only one 'found')
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);
        
        if (!result || !result.response) {
            throw new Error("The AI failed to generate a response. Please check your API key.");
        }

        const text = result.response.text();
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        const json = JSON.parse(text.substring(start, end + 1));

        // 4. Persistence
        const newPlan = new WorkPlan({
            userId: new mongoose.Types.ObjectId(userId),
            inputs: req.body,
            workplan: json
        });

        await newPlan.save();
        console.log("Clean-Slate Plan Created:", newPlan._id);

        res.status(200).json({ success: true, data: newPlan });

    } catch (error) {
        console.error("Clean-Slate Error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: `Generation failed: ${error.message}. Ensure your API key is active and has quota.` 
        });
    }
};

/**
 * Retrieval Controller
 */
exports.getAllPlans = async (req, res, next) => {
    try {
        const plans = await WorkPlan.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        next(error);
    }
};

exports.getSinglePlan = async (req, res, next) => {
    try {
        const plan = await WorkPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ success: false, message: "Not found" });
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        next(error);
    }
};

exports.updatePlan = async (req, res, next) => {
    try {
        const plan = await WorkPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ success: true, data: plan });
    } catch (error) {
        next(error);
    }
};

exports.deletePlan = async (req, res, next) => {
    try {
        await WorkPlan.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Plan deleted." });
    } catch (error) {
        next(error);
    }
};