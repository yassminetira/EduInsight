const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Choice = require("../models/Choice");
const Answer = require("../models/Answer");
const QuizAttempt = require("../models/QuizAttempt");
const Inscription = require("../models/Inscription");

// 1. Ajouter un quiz (+ conversion automatique si les questions arrivent en chaîne JSON)
exports.ajouterQuiz = async (req, res) => {
  try {
    let { questions, ...quizData } = req.body;

    const nouveauQuiz = new Quiz(quizData);
    await nouveauQuiz.save();

    if (typeof questions === "string") {
      try {
        questions = JSON.parse(questions);
      } catch (e) {
        questions = [];
      }
    }

    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        const questionDoc = new Question({
          Quiz: nouveauQuiz._id,
          statement: q.statement || q.questionText || q.question || "Question sans titre",
          options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ["Option 1", "Option 2"],
          correctAnswer: typeof q.correctAnswer === "number" ? q.correctAnswer : 0,
          type: q.type || "mcq",
        });
        await questionDoc.save();
      }
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

    const quiz = await Quiz.find()
      .populate("cours")
      .populate("createdBy")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// 3. Récupérer un quiz par ID (avec ses questions et options associées clairement)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("cours")
      .populate("createdBy");

    if (!quiz) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }

    const questions = await Question.find({ Quiz: quiz._id }).sort({ order: 1 });

    const questionsWithChoices = await Promise.all(
      questions.map(async (q) => {
        const choices = await Choice.find({ question: q._id }).sort({ order: 1 });
        return {
          _id: q._id,
          statement: q.statement,
          options: q.options || [],
          choices: choices.map((c) => ({ _id: c._id, text: c.text })),
        };
      })
    );

    res.json({ ...quiz.toObject(), questions: questionsWithChoices });
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
    const { choices, options, ...questionData } = req.body;
    const question = await Question.create({
      ...questionData,
      options: options || choices || [],
      Quiz: req.params.quizId,
    });

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
};

// 8. Soumettre le quiz et calculer le score
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quizId = req.params.id;
    const studentId = req.user.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz non trouvé" });

    const questions = await Question.find({ Quiz: quizId }).sort({ order: 1 });
    if (questions.length === 0) {
      return res.status(400).json({ message: "Ce quiz n'a pas de questions." });
    }

    const attempt = await QuizAttempt.create({
      student: studentId,
      Quiz: quizId,
      totalQuestions: questions.length,
      staredAt: new Date(),
      submitteAt: new Date(),
      score: 0,
    });

    let correctCount = 0;
    const details = [];

    for (const q of questions) {
      const choices = await Choice.find({ question: q._id }).sort({ order: 1 });
      
      const userAnswer = answers.find((a) => String(a.questionId) === String(q._id));
      
      let isCorrect = false;
      let selectedAnswerIndex = null;
      let selectedChoiceId = null;

      if (userAnswer) {
        selectedAnswerIndex = userAnswer.selectedAnswer !== undefined ? userAnswer.selectedAnswer : null;
        selectedChoiceId = userAnswer.selectedChoiceId || null;

        if (choices.length > 0) {
          const correctChoice = choices.find((c) => c.isCorrect);
          if (selectedChoiceId) {
            isCorrect = String(selectedChoiceId) === String(correctChoice?._id);
          } else if (selectedAnswerIndex !== null) {
            const chosenChoice = choices[selectedAnswerIndex];
            selectedChoiceId = chosenChoice?._id;
            isCorrect = chosenChoice && chosenChoice.isCorrect;
          }
        } else if (Array.isArray(q.options)) {
          isCorrect = selectedAnswerIndex === q.correctAnswer;
        }
      }

      if (isCorrect) correctCount++;

      await Answer.create({
        attempt: attempt._id,
        question: q._id,
        selectedChoice: selectedChoiceId || undefined,
        isCorrect,
        pointsEarned: isCorrect ? 1 : 0,
      });

      details.push({
        questionId: q._id,
        statement: q.statement,
        options: choices.length > 0 ? choices.map((c) => c.text) : q.options,
        selectedAnswer: selectedAnswerIndex,
        correctAnswer: choices.length > 0 ? choices.findIndex(c => c.isCorrect) : q.correctAnswer,
        isCorrect,
      });
    }

    const score = Math.round((correctCount / questions.length) * 100);
    attempt.score = score;
    await attempt.save();

    let courseCompleted = false;
    if (score >= (quiz.passingScore || 60)) {
      await Inscription.findOneAndUpdate(
        { student: studentId, cours: quiz.cours },
        { status: "completed" }
      );
      courseCompleted = true;
    }

    res.status(201).json({
      score,
      correctCount,
      total: questions.length,
      passingScore: quiz.passingScore || 60,
      courseCompleted,
      details,
      attempt,
    });
  } catch (err) {
    console.error("Erreur soumission quiz:", err);
    res.status(500).json({ message: "Erreur lors de la soumission.", error: err.message });
  }
};