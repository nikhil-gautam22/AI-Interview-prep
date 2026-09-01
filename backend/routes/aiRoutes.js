const express = require("express");
const {
  generateInterViewQuestions,
  generateConceptExplanation,
} = require("../controllers/aiController");
const { protect } = require("../middlewares/authmiddleware");

const router = express.Router();

router.post("/generate-questions", protect, generateInterViewQuestions);
router.post("/generate-explaination", protect, generateConceptExplanation);
router.post("/generate-explanation", protect, generateConceptExplanation);

module.exports = router;

