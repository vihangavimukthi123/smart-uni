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
    const { modules } = req.query; // Expecting comma separated values, e.g., ?modules=Web Development,Data Science
    const selectedModules = modules ? modules.split(",") : [];

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
      const moduleMatch = selectedModules.some(m => resource.module.toLowerCase().includes(m.toLowerCase()));
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

      // C. Popularity Score (+20) - Normalized
      if (resource.downloads > 50) {
        score += 20;
        reasons.push("Highly popular among students");
      } else if (resource.downloads > 10) {
        score += 10;
        reasons.push("Trending resource");
      }

      // D. Recency Score (+10) 
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
    // Only return those with a significant score or just sort everything
    const recommendations = scoredLearningResources
      .filter(r => r.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);

    const alternatives = scoredLearningResources
      .filter(r => r.recommendationScore === 0)
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
