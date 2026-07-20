// controllers/performanceMetricController.js
const PerformanceMetric = require("../models/PerformanceMetric");

// Ajouter une métrique de performance
exports.ajouterPerformanceMetric = async (req, res) => {
  try {
    const nouvelleMetric = new PerformanceMetric(req.body);
    await nouvelleMetric.save();
    res.status(201).json(nouvelleMetric);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer toutes les métriques
exports.listerPerformanceMetrics = async (req, res) => {
  try {
    const metrics = await PerformanceMetric.find()
      .populate("student")
      .populate("Cours");
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une métrique par ID
exports.getPerformanceMetricById = async (req, res) => {
  try {
    const metric = await PerformanceMetric.findById(req.params.id)
      .populate("student")
      .populate("Cours");
    if (!metric) {
      return res.status(404).json({ message: "Métrique non trouvée" });
    }
    res.json(metric);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour une métrique
exports.updatePerformanceMetric = async (req, res) => {
  try {
    const updatedMetric = await PerformanceMetric.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedMetric) {
      return res.status(404).json({ message: "Métrique non trouvée" });
    }
    res.json(updatedMetric);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une métrique
exports.deletePerformanceMetric = async (req, res) => {
  try {
    const deletedMetric = await PerformanceMetric.findByIdAndDelete(req.params.id);
    if (!deletedMetric) {
      return res.status(404).json({ message: "Métrique non trouvée" });
    }
    res.json({ message: "Métrique supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};