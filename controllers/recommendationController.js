// controllers/recommendationController.js
const Recommendation = require("../models/Recommendation");

// Ajouter une recommandation
exports.ajouterRecommendation = async (req, res) => {
  try {
    const nouvelleRecommendation = new Recommendation(req.body);
    await nouvelleRecommendation.save();
    res.status(201).json(nouvelleRecommendation);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer toutes les recommandations
exports.listerRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find()
      .populate("student");
      
    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une recommandation par ID
exports.getRecommendationById = async (req, res) => {
  try {
    const recommendation = await Recommendation.findById(req.params.id)
      .populate("student");
      
    if (!recommendation) {
      return res.status(404).json({ message: "Recommandation non trouvée" });
    }
    res.json(recommendation);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour une recommandation (ex: marquer comme vue)
exports.updateRecommendation = async (req, res) => {
  try {
    const updatedRecommendation = await Recommendation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRecommendation) {
      return res.status(404).json({ message: "Recommandation non trouvée" });
    }
    res.json(updatedRecommendation);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une recommandation
exports.deleteRecommendation = async (req, res) => {
  try {
    const deletedRecommendation = await Recommendation.findByIdAndDelete(req.params.id);
    if (!deletedRecommendation) {
      return res.status(404).json({ message: "Recommandation non trouvée" });
    }
    res.json({ message: "Recommandation supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};