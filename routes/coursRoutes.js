const express = require("express");
const router = express.Router();
const coursController = require("../controllers/coursController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploads"); 

router.post(
  "/ajouter",
  protect,
  authorize(["admin", "teacher"]),
  upload.single("Image"),  
  coursController.ajouterCours
);
router.put("/:id",protect,authorize(["admin", "teacher"]),
  upload.single("courseImage"),
  coursController.updateCours
);
router.post("/ajouterCours", protect, coursController.ajouterCours);
router.get("/list", coursController.listerCours);
router.get("/:id", coursController.getCourseById);
router.put("/:id",protect, coursController.updateCours);
router.delete("/:id", coursController.deleteCours);

module.exports = router;