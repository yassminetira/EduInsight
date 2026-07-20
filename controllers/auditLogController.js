// controllers/auditLogController.js
const AuditLog = require("../models/AuditLog");

// Ajouter un log d'audit
exports.ajouterAuditLog = async (req, res) => {
  try {
    const nouveauAuditLog = new AuditLog(req.body);
    await nouveauAuditLog.save();
    res.status(201).json(nouveauAuditLog);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer tous les logs d'audit
exports.listerAuditLogs = async (req, res) => {
  try {
    const auditLogs = await AuditLog.find().populate("user", "nom prenom email");
    res.json(auditLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un log d'audit par ID
exports.getAuditLogById = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id).populate("user", "nom prenom email");
    if (!auditLog) {
      return res.status(404).json({ message: "AuditLog non trouvé" });
    }
    res.json(auditLog);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour un log d'audit
exports.updateAuditLog = async (req, res) => {
  try {
    const updatedAuditLog = await AuditLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAuditLog) {
      return res.status(404).json({ message: "AuditLog non trouvé" });
    }
    res.json(updatedAuditLog);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un log d'audit
exports.deleteAuditLog = async (req, res) => {
  try {
    const deletedAuditLog = await AuditLog.findByIdAndDelete(req.params.id);
    if (!deletedAuditLog) {
      return res.status(404).json({ message: "AuditLog non trouvé" });
    }
    res.json({ message: "AuditLog supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};