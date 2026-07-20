// controllers/departementController.js
const Departement = require("../models/Departement");

// Ajouter un département
exports.ajouterDepartement = async (req, res) => {
  try {
    const nouveauDepartement = new Departement(req.body);
    await nouveauDepartement.save();
    res.status(201).json(nouveauDepartement);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer tous les départements
exports.listerDepartements = async (req, res) => {
  try {
    const departements = await Departement.find();
    res.json(departements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un département par ID
exports.getDepartementById = async (req, res) => {
  try {
    const departement = await Departement.findById(req.params.id);
    if (!departement) {
      return res.status(404).json({ message: "Département non trouvé" });
    }
    res.json(departement);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour un département
exports.updateDepartement = async (req, res) => {
  try {
    const updatedDepartement = await Departement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // retourne le document mis à jour
        runValidators: true // applique les validations du schema
      }
    );
    if (!updatedDepartement) {
      return res.status(404).json({ message: "Département non trouvé" });
    }
    res.json(updatedDepartement);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un département
exports.deleteDepartement = async (req, res) => {
  try {
    const deletedDepartement = await Departement.findByIdAndDelete(req.params.id);
    if (!deletedDepartement) {
      return res.status(404).json({ message: "Département non trouvé" });
    }
    res.json({ message: "Département supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};