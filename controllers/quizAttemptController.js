// controllers/quizAttemptController.js
const QuizAttempt = require("../models/QuizAttempt");

// Ajouter une tentative de quiz
exports.ajouterQuizAttempt = async (req, res) => {
  try {
    const nouvelleAttempt = new QuizAttempt(req.body);
    await nouvelleAttempt.save();
    res.status(201).json(nouvelleAttempt);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer toutes les tentatives
exports.listerQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find()
      .populate("student")
      .populate("Quiz");
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une tentative par ID
exports.getQuizAttemptById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate("student")
      .populate("Quiz");
    if (!attempt) {
      return res.status(404).json({ message: "Tentative non trouvée" });
    }
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour une tentative (ex: soumettre le quiz)
exports.updateQuizAttempt = async (req, res) => {
  try {
    const updatedAttempt = await QuizAttempt.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAttempt) {
      return res.status(404).json({ message: "Tentative non trouvée" });
    }
    res.json(updatedAttempt);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une tentative
exports.deleteQuizAttempt = async (req, res) => {
  try {
    const deletedAttempt = await QuizAttempt.findByIdAndDelete(req.params.id);
    if (!deletedAttempt) {
      return res.status(404).json({ message: "Tentative non trouvée" });
    }
    res.json({ message: "Tentative supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};