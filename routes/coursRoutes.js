const express = require("express");
const router = express.Router();
const coursController = require("../controllers/coursController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploads");

// ----------------------------------------------------
// Routes Publiques
// ----------------------------------------------------
router.get("/list", coursController.listerCours);
router.get("/:id", coursController.getCourseById);

// ----------------------------------------------------
// Routes Étudiants
// ----------------------------------------------------
router.post(
  "/:id/enroll",
  protect,
  authorize(["student"]),
  coursController.enrollCours
);

// ----------------------------------------------------
// Routes Enseignants / Admin
// ----------------------------------------------------
router.post(
  "/ajouter",
  protect,
  authorize(["admin", "teacher"]),
  upload.single("courseImage"),
  coursController.ajouterCours
);

router.put(
  "/:id",
  protect,
  authorize(["admin", "teacher"]),
  upload.single("courseImage"),
  coursController.updateCours
);

router.delete(
  "/:id",
  protect,
  authorize(["admin", "teacher"]),
  coursController.deleteCours
);

module.exports = router;