const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
 Quiz: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "Quiz",
           required: true,
          },
statement:{type:String,

        required: true},

 status: { type: String, enum: ['MCQ', 'TrueFalse', 'ShortAnswer'], default: 'MCQ' },
 point:Number,
 order:Number,
    })


module.exports = mongoose.model("Question", questionSchema);