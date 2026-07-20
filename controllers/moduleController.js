// controllers/moduleController.js
const Module = require("../models/Module");

// Ajouter un module
exports.ajouterModule = async (req, res) => {
  try {
    const nouveauModule = new Module(req.body);
    await nouveauModule.save();
    res.status(201).json(nouveauModule);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer tous les modules
exports.listerModules = async (req, res) => {
  try {
    const modules = await Module.find().populate("cours", "title");
    res.json(modules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un module par ID
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id).populate("cours");
    if (!module) {
      return res.status(404).json({ message: "Module non trouvé" });
    }
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour un module
exports.updateModule = async (req, res) => {
  try {
    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!updatedModule) {
      return res.status(404).json({ message: "Module non trouvé" });
    }
    res.json(updatedModule);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un module
exports.deleteModule = async (req, res) => {
  try {
    const deletedModule = await Module.findByIdAndDelete(req.params.id);
    if (!deletedModule) {
      return res.status(404).json({ message: "Module non trouvé" });
    }
    res.json({ message: "Module supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};