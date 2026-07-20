const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
 title: {
      type: String,
     required: true,

    },

 description: {
      type: String,
      required: true,
    },
order:Number,
cours: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Cours",
          required: true,
         },
 createdAt:Date,
        });

module.exports = mongoose.model("Module", moduleSchema);
