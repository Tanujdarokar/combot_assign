const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a feature title'],
    trim: true,
    maxlength: [120, 'Title cannot be more than 120 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['UI/UX', 'Integrations', 'Performance', 'General'],
    default: 'General'
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Under Review', 'Planned', 'In Progress', 'Completed'],
    default: 'Under Review'
  },
  votes: {
    type: Number,
    default: 0
  },
  voters: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for search, filter, and sorting performance
postSchema.index({ title: 'text', description: 'text' });
postSchema.index({ category: 1 });
postSchema.index({ status: 1 });
postSchema.index({ votes: -1 });
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
