import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  session_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['basic', 'detailed', 'bullet'],
    default: 'detailed'
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'notes'
});

// Update the updated_at timestamp before saving
noteSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for faster queries
noteSchema.index({ user_id: 1, created_at: -1 });
noteSchema.index({ session_id: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
