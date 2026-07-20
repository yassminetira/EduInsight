const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
 title: {
      type: String,
     required: true,

    },
content: {
      type: String,
     required: true,
    },
vedioUrl:String,
pdfUrl:String,
order:String,
module: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Module",
          required: true,
         },
createdAt:Date,
        });




module.exports = mongoose.model("Lesson", lessonSchema);
