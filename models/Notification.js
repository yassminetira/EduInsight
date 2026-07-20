const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "User",
       required: true,
      },
 title :String,
  message: {
      type: String,
      required: true,
    },
 type:String,
 isRead: {
      type: Boolean,
      default: false,
    },
 createdAt: Date,
    });


  
module.exports = mongoose.model("Notification", notificationSchema);
