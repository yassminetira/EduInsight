const mongoose = require("mongoose");

const performanceMetricSchema = new mongoose.Schema({
  student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
       },
    Cours: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Cours",
              required: true,
             },
    weekname:String,
    quizScorreAverage:Number,
    attendanceRate:Number,
    createdAt:Date,
            });

module.exports = mongoose.model("PerformanceMetric",performanceMetricSchema);