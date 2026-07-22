const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");


router.post("/ajouter", protect, authorize(['admin","teacher"']),notificationController.ajouterNotification);
router.get("/list", protect, notificationController.listerNotifications);
router.get("/:id", protect, notificationController.getNotificationById);
router.put("/:id", protect, notificationController.updateNotification);
router.delete("/:id", protect, notificationController.deleteNotification);
router.patch('/:id/read', protect, authorize('teacher'), notificationController.markAsRead); 



module.exports = router;