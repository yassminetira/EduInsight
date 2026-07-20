// models/AuditLog.js
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  ipAddress: { type: String },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);