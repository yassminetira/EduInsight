// controllers/recommendationController.js
const Recommendation = require("../models/Recommendation");
const { generateRecommendationsForStudent } = require("../servicesr/recommendationService");

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

// Récupérer toutes les recommandations (avec pagination)
exports.listerRecommendations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const recommendations = await Recommendation.find()
      .populate("student")
      .skip(skip)
      .limit(limit);

    const totalRecommendations = await Recommendation.countDocuments();

    res.json({
      recommendations,
      totalRecommendations,
      page,
      totalPages: Math.ceil(totalRecommendations / limit),
      limit,
    });
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

// Générer des recommandations pour l'étudiant connecté
exports.generateForCurrentStudent = async (req, res) => {
  try {
    const studentId = req.user.id;
    const recs = await generateRecommendationsForStudent(studentId);
    res.status(201).json({ generated: recs.length, recommendations: recs });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la génération.", error: err.message });
  }
};

// Récupérer les recommandations de l'étudiant connecté (Renvoie directement le tableau pour correspondre au front)
exports.getMyRecommendations = async (req, res) => {
  try {
    const recs = await Recommendation.find({ student: req.user.id }).sort({ createdAt: -1 });
    // On renvoie directement le tableau "recs" pour éviter l'erreur de filtre dans le front-end
    res.json(recs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marquer une recommandation comme lue
exports.markAsRead = async (req, res) => {
  try {
    const rec = await Recommendation.findOneAndUpdate(
      { _id: req.params.id, student: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!rec) return res.status(404).json({ message: "Recommandation non trouvée" });
    res.json(rec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Marquer toutes comme lues
exports.markAllAsRead = async (req, res) => {
  try {
    await Recommendation.updateMany({ student: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: "Toutes les recommandations sont marquées comme lues." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};