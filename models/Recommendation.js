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
  type:String,
  confidenceScore:Number,
  createdAt:Date,

    });


module.exports = mongoose.model("Recommendation",recommendationSchema );
