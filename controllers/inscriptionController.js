// controllers/inscriptionController.js
const Inscription = require("../models/Inscription");
const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");

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

//// Récupérer toutes les inscriptions (avec pagination)
exports.listerInscriptions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const inscriptions = await Inscription.find()
      .populate("student")
      .populate("cours")
      .skip(skip)
      .limit(limit);

    const totalInscriptions = await Inscription.countDocuments();

    res.json({
      inscriptions,
      totalInscriptions,
      page,
      totalPages: Math.ceil(totalInscriptions / limit),
      limit,
    });
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

// Récupérer bark les inscriptions متاع el student connecté
exports.getMyEnrollments = async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ student: req.user.id }).populate({
      path: "cours",
      populate: { path: "Teacher", select: "firstName lastName" },
    });
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer les certificats (cours complétés)
exports.getMyCertificates = async (req, res) => {
  try {
    const completed = await Inscription.find({
      student: req.user.id,
      status: "completed",
    }).populate("cours");

    const certificates = await Promise.all(
      completed.map(async (insc) => {
        const quizzes = await Quiz.find({ cours: insc.cours._id });
        const quizIds = quizzes.map((q) => q._id);

        const attempts = await QuizAttempt.find({
          student: req.user.id,
          Quiz: { $in: quizIds },
        });

        const grade =
          attempts.length > 0
            ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length)
            : null;

        return {
          _id: insc._id,
          courseTitle: insc.cours.Title,
          grade,
          date: insc.enrolledAt,
        };
      })
    );

    res.json(certificates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};