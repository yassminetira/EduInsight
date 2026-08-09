// controllers/inscriptionController.js
const Inscription = require("../models/Inscription");
const QuizAttempt = require("../models/QuizAttempt");
const Quiz = require("../models/Quiz");

// 1. Ajouter une inscription
exports.ajouterInscription = async (req, res) => {
  try {
    const nouvelleInscription = new Inscription(req.body);
    await nouvelleInscription.save();
    res.status(201).json(nouvelleInscription);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// 2. Récupérer toutes les inscriptions (pagination)
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

// 3. Récupérer une inscription par ID
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

// 4. Mettre à jour une inscription
exports.updateInscription = async (req, res) => {
  try {
    const updatedInscription = await Inscription.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
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

// 5. Supprimer une inscription
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

// 6. Récupérer les inscriptions du student connecté
exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const inscriptions = await Inscription.find({
      $or: [{ student: userId }, { Student: userId }, { user: userId }],
    }).populate({
      path: "cours",
      populate: { path: "Teacher", select: "firstName lastName name" },
    });

    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Récupérer UNIQUEMENT les certificats des cours "completed"
exports.getMyCertificates = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Recherche stricte des inscriptions qui ont le statut "completed"
    const completed = await Inscription.find({
      $or: [{ student: userId }, { Student: userId }, { user: userId }],
      status: { $regex: /^completed$/i },
    }).populate("cours");

    const certificates = await Promise.all(
      completed.map(async (insc) => {
        // Sécurité si le cours est supprimé
        if (!insc || !insc.cours) return null;

        const courseId = insc.cours._id;
        const courseTitle = insc.cours.Title || insc.cours.title || "Cours sans titre";

        let grade = null;
        try {
          const quizzes = await Quiz.find({
            $or: [{ cours: courseId }, { course: courseId }, { Cours: courseId }],
          });
          const quizIds = quizzes.map((q) => q._id);

          if (quizIds.length > 0) {
            const attempts = await QuizAttempt.find({
              $or: [{ student: userId }, { Student: userId }, { user: userId }],
              $or: [{ Quiz: { $in: quizIds } }, { quiz: { $in: quizIds } }],
            });

            if (attempts.length > 0) {
              const scores = attempts.map((a) => a.score || 0);
              grade = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
            }
          }
        } catch (quizErr) {
          console.error("Erreur calcul note quiz:", quizErr.message);
        }

        return {
          _id: insc._id,
          courseTitle: courseTitle,
          grade: grade ?? 90, // Note par défaut si aucun quiz n'a encore été fait
          date: insc.enrolledAt || insc.createdAt || new Date(),
        };
      })
    );

    // Retourne uniquement les cours réellement complétés
    res.json(certificates.filter((c) => c !== null));
  } catch (err) {
    console.error("Erreur getMyCertificates:", err.message);
    res.status(500).json({ error: err.message });
  }
};