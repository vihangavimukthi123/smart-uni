const LearningResource = require('../models/LearningResource');
const SearchHistory = require('../models/SearchHistory');

// @desc    Get all resources
const getLearningResources = async (req, res) => {
  try {
    const resources = await LearningResource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get resources by user
const getUserLearningResources = async (req, res) => {
  try {
    const userId = req.params.userId || "JD123";
    const resources = await LearningResource.find({ userId }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Upload resource
const uploadLearningResource = async (req, res) => {
  try {
    const resource = await LearningResource.create(req.body);
    res.status(201).json(resource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update resource
const updateLearningResource = async (req, res) => {
  try {
    const updated = await LearningResource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete resource
const deleteLearningResource = async (req, res) => {
  try {
    await LearningResource.findByIdAndDelete(req.params.id);
    res.json({ message: "LearningResource deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Track search history
const trackHistory = async (req, res) => {
  try {
    const { userId, query } = req.body;
    if (!userId || !query) return res.status(400).json({ message: "Missing required fields" });

    await SearchHistory.create({ userId, query });
    res.status(201).json({ message: "Search history tracked" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get recommended resources
const getRecommendedLearningResources = async (req, res) => {
  try {
    const { userId } = req.params;
    const { modules, year, semester, skills } = req.query;

    // Parse query parameters
    const selectedModules = modules ? modules.split(",").map(m => m.trim()) : [];
    const userYear = year ? Number(year) : null;
    const userSemester = semester ? Number(semester) : null;
    const userSkills = skills ? skills.split(",").map(s => s.trim().toLowerCase()) : [];

    // 1. Fetch all resources
    const allLearningResources = await LearningResource.find();

    // 2. Fetch user search history
    const userHistory = await SearchHistory.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const historyQueries = userHistory.map(h => h.query.toLowerCase());

    // 3. Scoring Algorithm
    const scoredLearningResources = allLearningResources.map(resource => {
      let score = 0;
      const reasons = [];

      // A. Module Match Score (+40)
      const moduleMatch = selectedModules.some(m => resource.module && resource.module.toLowerCase().includes(m.toLowerCase()));
      if (moduleMatch) {
        score += 40;
        reasons.push(`Matches your selected module (${resource.module})`);
      }

      // B. Keyword Match Score (+30)
      const keywordMatch = historyQueries.some(query =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query)
      );
      if (keywordMatch) {
        score += 30;
        reasons.push("Related to your recent search interest");
      }

      // C. Year/Semester Match Score (+25) - NEW
      let yearSemesterMatch = false;
      if (userYear && resource.year === userYear) {
        score += 25;
        yearSemesterMatch = true;
        reasons.push(`For your year (Year ${userYear})`);
      }
      if (userSemester && resource.semester === userSemester && !yearSemesterMatch) {
        score += 15;
        reasons.push(`For your semester (Sem ${userSemester})`);
      }

      // D. Skill Match Score (+20) - NEW
      if (userSkills.length > 0) {
        const resourceText = (resource.title + " " + resource.description + " " + (resource.subject || "")).toLowerCase();
        const skillMatch = userSkills.some(skill => resourceText.includes(skill));
        if (skillMatch) {
          score += 20;
          reasons.push("Matches your skills");
        }
      }

      // E. Popularity Score (+20)
      if (resource.downloads > 50) {
        score += 20;
        reasons.push("Highly popular among students");
      } else if (resource.downloads > 10) {
        score += 10;
        reasons.push("Trending resource");
      }

      // F. Recency Score (+10) 
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      if (resource.createdAt > oneMonthAgo) {
        score += 10;
        reasons.push("Recently updated resource");
      }

      return {
        ...resource.toObject(),
        recommendationScore: score,
        recommendationReason: reasons.join(" & "),
      };
    });

    // 4. Filter & Rank
    // Return those with significant score, or all if user is new
    const recommendations = scoredLearningResources
      .filter(r => r.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);

    // If very few recommendations, fill with trending/recent resources
    const alternatives = scoredLearningResources
      .filter(r => r.recommendationScore === 0)
      .sort((a, b) => {
        // Sort by downloads then recency
        if (b.downloads !== a.downloads) return b.downloads - a.downloads;
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 5);

    res.json({
      recommendations,
      alternatives,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getLearningResources, getUserLearningResources, uploadLearningResource, updateLearningResource, deleteLearningResource, trackHistory, getRecommendedLearningResources };
