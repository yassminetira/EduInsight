const mongoose = require("mongoose");

const coursSchema = new mongoose.Schema({
    Title : { type: String, required: true },
    Description : { type: String, required: true },
    Department: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Departement", required: true },
    
    Teacher : { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", required: true },
        
    Duration : String,
    Level : String,
    Image : String,

},{ timestamps: true });

module.exports = mongoose.model('Cours', coursSchema);