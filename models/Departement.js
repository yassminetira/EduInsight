const mongoose = require("mongoose");

const departementSchema = new mongoose.Schema({
name: {
      type: String,
     required: true,

    },

 description: {
      type: String,
      required: true,
    },
 
createdAt : Date
});

module.exports = mongoose.model("Departement", departementSchema);
