const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.post("/generate", protect, authorize(["student"]), recommendationController.generateForCurrentStudent);
router.get("/my", protect, authorize(["student"]), recommendationController.getMyRecommendations);
router.patch("/:id/read", protect, authorize(["student"]), recommendationController.markAsRead);
router.patch("/read-all", protect, authorize(["student"]), recommendationController.markAllAsRead);

module.exports = router;