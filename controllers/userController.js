// controllers/userController.js
const User = require("../models/User");
const Inscription = require("../models/Inscription");
const QuizAttempt = require("../models/QuizAttempt");

// Ajouter un utilisateur 
exports.ajouterUtilisateur = async (req, res) => {
  try {
    const nouvelUser = new User({
      ...req.body,
      avatar: req.file ? req.file.filename : req.body.avatar,
    });

    await nouvelUser.save();
    res.status(201).json(nouvelUser);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer tous les utilisateurs (avec pagination)
exports.listerUtilisateurs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);
    const totalUsers = await User.countDocuments();

    res.json({
      users,
      totalUsers,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      limit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un utilisateur par ID
exports.getUtilisateurById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour un utilisateur
exports.updateUtilisateur = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un utilisateur
exports.deleteUtilisateur = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};

// Récupérer bark les students (avec Enrolled + Avg Grade)
exports.listerStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" });

    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const enrolledCount = await Inscription.countDocuments({ student: student._id });

        const attempts = await QuizAttempt.find({ student: student._id });
        const avgGrade =
          attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
            : null;

        return { ...student.toObject(), enrolledCount, avgGrade };
      })
    );

    res.json(studentsWithStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};