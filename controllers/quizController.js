 // controllers/quizController.js
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

// 1. Ajouter un quiz (+ conversion automatique si les questions arrivent en chaîne JSON)
exports.ajouterQuiz = async (req, res) => {
  try {
    let { questions, ...quizData } = req.body;

    // Créer et enregistrer le Quiz
    const nouveauQuiz = new Quiz(quizData);
    await nouveauQuiz.save();

    // Si les questions sont envoyées sous forme de string JSON, on les parse
    if (typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
      } catch (e) {
        questions = [];
      }
    }

    // Insérer les questions dans le modèle Question
    if (Array.isArray(questions) && questions.length > 0) {
      const questionsDocs = questions.map((q) => ({
        Quiz: nouveauQuiz._id, // Référence avec Q majuscule
        statement: q.statement || q.questionText || q.question || "Question sans titre",
        options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ["Option 1", "Option 2"],
        correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
        type: q.type || "mcq",
      }));

      await Question.insertMany(questionsDocs);
    }

    res.status(201).json(nouveauQuiz);
  } catch (err) {
    console.error("Erreur insertion quiz:", err);
    res.status(400).json({ message: "Erreur d'ajout", error: err.message });
  }
};

// 2. Récupérer tous les quiz (Tri par date récente + pagination + décompte des questions)
exports.listerQuiz = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Tri par date de création inverse (les plus récents en premier)
    const quiz = await Quiz.find()
      .populate("cours")
      .populate("createdBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Compter les questions associées à chaque quiz
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

// 3. Récupérer un quiz par ID (avec ses questions associées)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("cours")
      .populate("createdBy");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }

    const questions = await Question.find({ Quiz: quiz._id });
    res.json({ ...quiz.toObject(), questions });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
  }
};

// 4. Mettre à jour un quiz
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

// 5. Supprimer un quiz et toutes ses questions associées
exports.deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }

    // Nettoyage en cascade des questions
    await Question.deleteMany({ Quiz: req.params.id });

    res.json({ message: "Quiz supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur de suppression", error: err.message });
  }
};

// 6. Publier un quiz
exports.publishQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// 7. Ajouter une question individuelle à un quiz
exports.addQuestion = async (req, res, next) => {
  try {
    const { choices, ...questionData } = req.body;
    const question = await Question.create({
      ...questionData,
      Quiz: req.params.quizId,
    });

    if (choices && choices.length > 0) {
      const choiceDocs = choices.map((c) => ({ ...c, question: question._id }));
      await Choice.insertMany(choiceDocs);
    }

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};