// controllers/quizController.js
const Quiz = require("../models/Quiz");

// Ajouter un quiz
exports.ajouterQuiz = async (req, res) => {
  try {
    const nouveauQuiz = new Quiz(req.body);
    await nouveauQuiz.save();
    res.status(201).json(nouveauQuiz);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer tous les quiz
exports.listerQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.find().populate("cours")
.populate("createdBy");
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un quiz par ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("cours")
.populate("createdBy");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour un quiz
exports.updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }
    res.json(updatedQuiz);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }
    res.json({ message: "Quiz supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};