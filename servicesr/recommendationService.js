const Recommendation = require("../models/Recommendation");
const Inscription = require("../models/Inscription");
const QuizAttempt = require("../models/QuizAttempt");

// Algorithme déterministe simple : recommande selon les scores faibles
exports.generateRecommendationsForStudent = async (studentId) => {
  const attempts = await QuizAttempt.find({ student: studentId }).populate("Quiz");
  const lowScoreAttempts = attempts.filter((a) => a.score < 60);

  const recommendations = [];

  for (const attempt of lowScoreAttempts) {
    if (!attempt.Quiz) continue;

    const exists = await Recommendation.findOne({
      student: studentId,
      message: { $regex: attempt.Quiz.title, $options: "i" },
    });

    if (!exists) {
      const rec = await Recommendation.create({
        student: studentId,
        message: `Nous vous recommandons de revoir le cours lié à "${attempt.Quiz.title}" (score obtenu : ${attempt.score}%).`,
        type: "revision",
        confidenceScore: Math.round((100 - attempt.score) / 100 * 100) / 100,
        createdAt: new Date(),
      });
      recommendations.push(rec);
    }
  }

  return recommendations;
};