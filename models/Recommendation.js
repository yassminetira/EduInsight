const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: String,
  confidenceScore: Number,
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  courseId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Cours",
},
courseTitle: String,
});

module.exports = mongoose.model("Recommendation", recommendationSchema);