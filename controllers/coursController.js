// controllers/coursController.js
const Cours = require("../models/Cours");

exports.ajouterCours = async (req, res) => {
  try {
    const nouveau = new Cours({
      ...req.body,
      Image: req.file ? req.file.filename : req.body.Image,
    });
    await nouveau.save();
    res.status(201).json(nouveau);
  } catch (err) {
    res.status(400).json({ message: "Failed to create cours.", error: err.message });
  }
};

exports.listerCours = async (req, res) => {
  try {
    const liste = await Cours.find();
    res.json(liste);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve cours.", error: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const item = await Cours.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Course not found." });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve course.", error: err.message });
  }
};

exports.updateCours = async (req, res) => {
  try {const updateData = { ...req.body };

    if (req.file) {
      updateData.image = `uploads/courses/${req.file.filename}`;
    }
    const updated = await Cours.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Course not found." });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Failed to update cours.", error: err.message });
  }
};

exports.deleteCours = async (req, res) => {
  try {
    const deleted = await Cours.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Course not found." });
    }
    res.json({ message: "Course deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete course.", error: err.message });
  }
};