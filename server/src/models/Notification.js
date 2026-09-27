const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', default: null },
  executionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution', default: null },
  type: { type: String, enum: ['success', 'failure', 'escalation', 'system'], default: 'system' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
