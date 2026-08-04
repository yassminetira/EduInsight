// controllers/coursController.js
const Cours = require("../models/Cours");
const Inscription = require("../models/Inscription");

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cours = await Cours.find().skip(skip).limit(limit);
    const totalCours = await Cours.countDocuments();

    res.json({
      cours,
      totalCours,
      page,
      totalPages: Math.ceil(totalCours / limit),
      limit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  };

}
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
exports.enrollCours = async (req, res, next) => {
  try {
    const inscription = await Inscription.create({
      student: req.user.id,
      cours: req.params.id,
    });
    res.status(201).json({ success: true, data: inscription });
  } catch (error) {
    next(error);
  }
};