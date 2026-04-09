const express = require('express');
const {
  getLearningResources,
  getUserLearningResources,
  uploadLearningResource,
  updateLearningResource,
  deleteLearningResource,
  trackHistory,
  getRecommendedLearningResources
} = require('../controllers/learningResourceController.js');

const router = express.Router();

router.get("/", getLearningResources);
router.post("/", uploadLearningResource);
router.get("/user/:userId", getUserLearningResources);
router.put("/:id", updateLearningResource);
router.delete("/:id", deleteLearningResource);
router.post("/history", trackHistory);
router.get("/recommend/:userId", getRecommendedLearningResources);

module.exports = router;

