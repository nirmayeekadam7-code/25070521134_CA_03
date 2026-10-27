const mongoose = require('mongoose');

const CATEGORIES = [
  'Water', 'Electricity', 'Internet', 'Cleanliness',
  'Plumbing', 'Furniture', 'Mess/Food', 'Security', 'Other',
];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Resolved'];

// Each status change is stored here (used for the timeline on the detail page)
const historySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    remark: { type: String, default: '' },
    changedBy: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 100 },
    category: { type: String, enum: CATEGORIES, required: [true, 'Category is required'] },
    description: { type: String, required: [true, 'Description is required'], trim: true, maxlength: 1000 },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    adminRemark: { type: String, default: '' },
    statusHistory: [historySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.PRIORITIES = PRIORITIES;
module.exports.STATUSES = STATUSES;
