// controllers/questionController.js
const Question = require("../models/Question");

// Ajouter une question
exports.ajouterQuestion = async (req, res) => {
  try {
    const nouvelleQuestion = new Question(req.body);
    await nouvelleQuestion.save();
    res.status(201).json(nouvelleQuestion);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer toutes les questions
exports.listerQuestions = async (req, res) => {
  try {
    const questions = await Question.find().populate("Quiz");
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une question par ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("Quiz");
    if (!question) {
      return res.status(404).json({ message: "Question non trouvée" });
    }
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour une question
exports.updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question non trouvée" });
    }
    res.json(updatedQuestion);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une question
exports.deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await Question.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question non trouvée" });
    }
    res.json({ message: "Question supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};