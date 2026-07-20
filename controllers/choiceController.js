// controllers/choiceController.js
const Choice = require("../models/Choice");

// Ajouter un choix
exports.ajouterChoice = async (req, res) => {
  try {
    const nouveauChoice = new Choice(req.body);
    await nouveauChoice.save();
    res.status(201).json(nouveauChoice);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer tous les choix
exports.listerChoices = async (req, res) => {
  try {
    const choices = await Choice.find().populate("question", "enonce").sort("order");
    res.json(choices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un choix par ID
exports.getChoiceById = async (req, res) => {
  try {
    const choice = await Choice.findById(req.params.id).populate("question", "enonce");
    if (!choice) {
      return res.status(404).json({ message: "Choice non trouvé" });
    }
    res.json(choice);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour un choix
exports.updateChoice = async (req, res) => {
  try {
    const updatedChoice = await Choice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedChoice) {
      return res.status(404).json({ message: "Choice non trouvé" });
    }
    res.json(updatedChoice);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un choix
exports.deleteChoice = async (req, res) => {
  try {
    const deletedChoice = await Choice.findByIdAndDelete(req.params.id);
    if (!deletedChoice) {
      return res.status(404).json({ message: "Choice non trouvé" });
    }
    res.json({ message: "Choice supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};