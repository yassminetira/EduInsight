const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const  protect  = require("../middlewares/authMiddleware");
const authorize = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/uploads"); 

router.post(
  "/ajouter",
  protect,
  authorize(["admin", "teacher","student"]),
  upload.single("avatar"),  
 userController.ajouterUtilisateur
);

router.get("/list", protect, authorize(["admin", "teacher"]), userController.listerUtilisateurs);
router.get("/students", protect, authorize(["admin","teacher"]), userController.listerStudents);
router.get("/:id", protect, authorize(["admin", "teacher"]), userController.getUtilisateurById);
router.put("/:id", protect, authorize(["admin","teacher"]), userController.updateUtilisateur);
router.delete("/:id", protect, authorize(["admin"]), userController.deleteUtilisateur);


module.exports = router;