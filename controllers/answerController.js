// controllers/answerController.js
const Answer = require("../models/Answer");

// Ajouter une réponse
exports.ajouterAnswer = async (req, res) => {
  try {
    const nouvelleAnswer = new Answer(req.body);
    await nouvelleAnswer.save();
    res.status(201).json(nouvelleAnswer);
  } catch (err) {
    res.status(400).json({ message: "Erreur d’ajout", error: err.message });
  }
};

// Récupérer toutes les réponses
exports.listerAnswers = async (req, res) => {
  try {
    const answers = await Answer.find();
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une réponse par ID
exports.getAnswerById = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    res.json(answer);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour une réponse
exports.updateAnswer = async (req, res) => {
  try {
    const updatedAnswer = await Answer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,          // retourne le document mis à jour
        runValidators: true // applique les validations du schema
      }
    );

    if (!updatedAnswer) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    res.json(updatedAnswer);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une réponse
exports.deleteAnswer = async (req, res) => {
  try {
    const deletedAnswer = await Answer.findByIdAndDelete(req.params.id);

    if (!deletedAnswer) {
      return res.status(404).json({ message: "Réponse non trouvée" });
    }

    res.json({ message: "Réponse supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};