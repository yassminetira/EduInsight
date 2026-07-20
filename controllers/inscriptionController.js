// controllers/inscriptionController.js
const Inscription = require("../models/Inscription");

// Ajouter une inscription
exports.ajouterInscription = async (req, res) => {
  try {
    const nouvelleInscription = new Inscription(req.body);
    await nouvelleInscription.save();
    res.status(201).json(nouvelleInscription);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer toutes les inscriptions
exports.listerInscriptions = async (req, res) => {
  try {
    const inscriptions = await Inscription.find()
      .populate("student")
      .populate("cours");
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une inscription par ID
exports.getInscriptionById = async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id)
      .populate("student")
      .populate("cours");
    if (!inscription) {
      return res.status(404).json({ message: "Inscription non trouvée" });
    }
    res.json(inscription);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour une inscription
exports.updateInscription = async (req, res) => {
  try {
    const updatedInscription = await Inscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!updatedInscription) {
      return res.status(404).json({ message: "Inscription non trouvée" });
    }
    res.json(updatedInscription);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une inscription
exports.deleteInscription = async (req, res) => {
  try {
    const deletedInscription = await Inscription.findByIdAndDelete(req.params.id);
    if (!deletedInscription) {
      return res.status(404).json({ message: "Inscription non trouvée" });
    }
    res.json({ message: "Inscription supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};