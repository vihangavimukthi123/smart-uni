const mongoose = require('mongoose');
const WorkPlan = require('../models/workPlan');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Fallback chain: try fast model first, then lightweight backup ──
const GROQ_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
];

async function tryGenerate(prompt) {
    let lastError;
    for (const model of GROQ_MODELS) {
        try {
            console.log(`🤖 Trying Groq model: ${model}`);
            const response = await groq.chat.completions.create({
                model,
                messages: [{ role: "user", content: prompt }],
                temperature: 0.4,
                max_tokens: 8192,
            });
            const text = response.choices[0]?.message?.content;
            if (!text) throw new Error("Empty response from Groq.");
            console.log(`✅ Groq model succeeded: ${model}`);
            return text;
        } catch (err) {
            const msg = err.message || "";
            const isSkippable =
                msg.includes("429") || msg.includes("quota") ||
                msg.includes("rate") || msg.includes("limit") ||
                msg.includes("overloaded") || msg.includes("503") ||
                msg.includes("404") || msg.includes("not found");
            console.warn(`⚠️  Groq model ${model} skipped: ${msg.split('.')[0]}`);
            lastError = err;
            if (!isSkippable) throw err;
        }
    }
    throw new Error(`All Groq models failed. Check your GROQ_API_KEY or retry. Last: ${lastError?.message}`);
}

/**
 * Clean Slate Workplan Generator
 * Focus: Stability, Accuracy, and Reliability
 */
exports.generateWorkplan = async (req, res, next) => {
    try {
        const { availability, saturday, sunday, tasks, studyInterval, userId, lifeEvents, energyLevel, bedtime, wakeup } = req.body;

        // 1. Validation
        if (!userId) return res.status(401).json({ success: false, message: "Authentication required." });

        const startDate = new Date().toISOString().split('T')[0];
        const taskList = (tasks || []).map((t, i) =>
            `  ${i + 1}. "${t.name}" — Deadline: ${t.deadline}, Priority: ${t.priority}`
        ).join('\n');
        const lifeEventList = (lifeEvents || []).length > 0
            ? (lifeEvents).map(e =>
                `  - ${e.name}: ${e.days?.join(', ')} from ${e.startTime} to ${e.endTime}`
              ).join('\n')
            : '  None';

        // 2. Rich Academic Performance Coach Prompt
        const prompt = `
You are an expert Academic Performance Coach and Productivity Strategist.

### STUDENT PROFILE
- **Energy Profile:** ${energyLevel || 'Balanced'}
- **Sleep Schedule:** Bedtime ${bedtime || '23:00'} | Wake-up ${wakeup || '07:00'}
- **Study Method:** ${studyInterval}

### WEEKLY AVAILABILITY
- **Weekday Window:** ${availability}
- **Saturday:** ${saturday || 'Not specified'}
- **Sunday:** ${sunday || 'Not specified'}

### CORE TASKS (sorted by urgency/priority)
${taskList}

### FIXED LIFE EVENTS (MUST be respected — do not schedule study blocks during these)
${lifeEventList}

### SCHEDULING CONSTRAINTS & LOGIC
1. **Prioritization:** Use Eisenhower Matrix logic. Place High-priority tasks with soonest deadlines in the earliest/highest-energy slots.
2. **Break Logic:**
   - If Pomodoro (25m): 25 min work / 5 min break. After every 4 cycles, insert a 20-minute long break.
   - If Deep Work (45–90m): Insert a 10–15 min break between work sets.
3. **Buffer Zones:** Add a 5–10 minute transition buffer BEFORE and AFTER every Fixed Life Event.
4. **Cognitive Load:** Never schedule more than 3 hours of High-Priority work back-to-back without a 30+ minute meal or rest break.
5. **Rest:** Do not schedule study after bedtime or before wake-up.
6. **Span:** Generate a plan starting from ${startDate} covering every day until the last deadline. Skip days with no availability.
7. **Task Weighting:** Analyze the task name to determine effort. Assign extra study sessions ('High' weight) to keywords like 'Project,' 'Exam,' or 'Final.' Assign fewer sessions ('Low' weight) to 'Quiz,' 'Note,' or 'Meeting.' If the nature of the task is unclear, default to scheduling approximately a 2-hour total block of sessions for that task.

### REQUIRED OUTPUT FORMAT
Respond ONLY with a valid JSON object in this exact structure. No markdown, no extra text:
{
  "summary": {
    "scope_value": "<Session count + method, e.g. '18 Pomodoro Sessions' or '9 Deep Work Blocks'>",
    "effort_value": "<Estimated total study hours as string, e.g. '14.5 hrs'>",
    "target_completion": "<Date of last deadline as YYYY-MM-DD>"
  },
  "detailed_plan": [
    {
      "day_name": "<e.g. Monday>",
      "formatted_date": "<YYYY-MM-DD>",
      "daily_goal": "<One sentence focus goal for the day>",
      "time_slots": [
        {
          "start_time": "<e.g. 6:00 PM>",
          "end_time": "<e.g. 6:25 PM>",
          "task_title": "<Task name or 'Break' or 'Life Event: [name]'>",
          "action_step": "<Specific micro-goal, e.g. 'Draft intro paragraph of report'>"
        }
      ]
    }
  ],
  "academic_tips": [
    "<Personalised, actionable tip>"
  ]
}`;

        console.log("🎯 Generating AI Workplan with Performance Coach prompt...");

        // 3. Try models in fallback order
        const text = await tryGenerate(prompt);

        // ── Robust JSON extractor ──
        function extractJSON(raw) {
            // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
            let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');
            // 2. Find the outermost { ... }
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start === -1 || end === -1) throw new Error("No JSON object found in AI response.");
            cleaned = cleaned.substring(start, end + 1);
            // 3. Remove trailing commas before } or ] (common LLM mistake)
            cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
            // 4. Remove single-line // comments
            cleaned = cleaned.replace(/\/\/[^\n]*/g, '');
            return JSON.parse(cleaned);
        }

        const json = extractJSON(text);

        // 4. Persistence
        const newPlan = new WorkPlan({
            userId: new mongoose.Types.ObjectId(userId),
            inputs: req.body,
            workplan: json
        });

        await newPlan.save();
        console.log("✅ Performance Workplan Created:", newPlan._id);

        res.status(200).json({ success: true, data: newPlan });

    } catch (error) {
        console.error("❌ Workplan Generation Error:", error.message);
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