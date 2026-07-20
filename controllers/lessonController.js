// controllers/lessonController.js
const Lesson = require("../models/Lesson");

// Ajouter une leçon
exports.ajouterLesson = async (req, res) => {
  try {
    const nouvelleLesson = new Lesson(req.body);
    await nouvelleLesson.save();
    res.status(201).json(nouvelleLesson);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer toutes les leçons
exports.listerLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer une leçon par ID
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson non trouvée" });
    }
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour une leçon
exports.updateLesson = async (req, res) => {
  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson non trouvée" });
    }
    res.json(updatedLesson);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer une leçon
exports.deleteLesson = async (req, res) => {
  try {
    const deletedLesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!deletedLesson) {
      return res.status(404).json({ message: "Lesson non trouvée" });
    }
    res.json({ message: "Lesson supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};