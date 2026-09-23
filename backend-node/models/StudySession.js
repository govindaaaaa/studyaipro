import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  session_type: {
    type: String,
    enum: ['study', 'pomodoro', 'review', 'practice'],
    default: 'study'
  },
  document_id: {
    type: String
  },
  start_time: {
    type: Date,
    required: true,
    default: Date.now
  },
  end_time: {
    type: Date
  },
  duration_minutes: {
    type: Number,
    default: 0
  },
  breaks_taken: {
    type: Number,
    default: 0
  },
  activities: [{
    type: {
      type: String,
      enum: ['reading', 'quiz', 'notes', 'flashcards', 'chat']
    },
    timestamp: Date,
    duration_seconds: Number
  }],
  notes: {
    type: String
  },
  productivity_rating: {
    type: Number,
    min: 1,
    max: 5
  },
  completed: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'study_sessions'
});

studySessionSchema.index({ user_id: 1, created_at: -1 });

// Calculate duration before saving
studySessionSchema.pre('save', function(next) {
  if (this.end_time && this.start_time) {
    this.duration_minutes = Math.round((this.end_time - this.start_time) / (1000 * 60));
  }
  next();
});

const StudySession = mongoose.model('StudySession', studySessionSchema);

export default StudySession;
