// controllers/quizController.js
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

// Ajouter un quiz
exports.ajouterQuiz = async (req, res) => {
  try {
    const nouveauQuiz = new Quiz(req.body);
    await nouveauQuiz.save();
    res.status(201).json(nouveauQuiz);
  } catch (err) {
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// Récupérer tous les quiz (avec pagination)
exports.listerQuiz = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const quiz = await Quiz.find()
      .populate("cours")
      .populate("createdBy")
      .skip(skip)
      .limit(limit);

    // Zid عدد الأسئلة لكل quiz
    const quizWithCount = await Promise.all(
      quiz.map(async (q) => {
        const questionCount = await Question.countDocuments({ Quiz: q._id });
        return { ...q.toObject(), questionCount };
      })
    );

    const totalQuizzes = await Quiz.countDocuments();

    res.json({
      quizzes: quizWithCount,
      totalQuizzes,
      page,
      totalPages: Math.ceil(totalQuizzes / limit),
      limit,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un quiz par ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("cours")
.populate("createdBy");
    if (!quiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// Mettre à jour un quiz
exports.updateQuiz = async (req, res) => {
  try {
    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedQuiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }
    res.json(updatedQuiz);
  } catch (err) {
    res.status(400).json({ message: "Erreur de mise à jour", error: err.message });
  }
};

// Supprimer un quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }
    res.json({ message: "Quiz supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};
exports. publishQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, { isPublished: true }, { new: true });
    res.status(200).json({ success: true, data: quiz });
  } catch (error) { next(error); }
};
exports. addQuestion = async (req, res, next) => {
  try {
    const { choices, ...questionData } = req.body;
    const question = await Question.create({ ...questionData, quiz: req.params.quizId });

    if (choices && choices.length > 0) {
      const choiceDocs = choices.map(c => ({ ...c, question: question._id }));
      await Choice.insertMany(choiceDocs);
    }

    res.status(201).json({ success: true, data: question });
  } catch (error) { next(error); }
};
