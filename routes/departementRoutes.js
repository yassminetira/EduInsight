// routes/departementRoutes.js
const express = require("express");
const router = express.Router();
const departementController = require("../controllers/departementController");
const protect = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");

router.post("/ajouter", protect, authorize(["admin"]), departementController.ajouterDepartement);
router.get("/list", departementController.listerDepartements);
router.get("/:id", departementController.getDepartementById);
router.put("/:id", protect, authorize(["admin"]), departementController.updateDepartement);
router.delete("/:id", protect, authorize(["admin"]), departementController.deleteDepartement);

module.exports = router;