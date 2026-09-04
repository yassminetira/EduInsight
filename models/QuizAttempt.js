const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
     },
Quiz: {
          type: mongoose.Schema.Types.ObjectId,
           ref: "Quiz",
           required: true,
          },
score:Number,
totalQuestions:Number,
staredAt:Date,
submitteAt:Date,
        })

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);