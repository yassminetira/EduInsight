// models/Choice.js
const mongoose = require("mongoose");

const choiceSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Choice", choiceSchema);