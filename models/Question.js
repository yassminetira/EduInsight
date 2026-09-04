const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  Quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  statement: {
    type: String,
    required: true,
  },
  type: { 
    type: String, 
    enum: ['MCQ', 'mcq', 'TrueFalse', 'truefalse', 'ShortAnswer', 'shortanswer'], 
    default: 'mcq' 
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswer: {
    type: Number,
    required: true
  },
  point: Number,
  order: Number,
});

module.exports = mongoose.model("Question", questionSchema);