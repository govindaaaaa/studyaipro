import mongoose from 'mongoose';

const mcqScoreSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  session_id: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  total_questions: {
    type: Number,
    required: true,
    min: 1
  },
  correct_answers: {
    type: Number,
    required: true,
    min: 0
  },
  score_percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  time_taken_seconds: {
    type: Number,
    default: 0,
    min: 0
  },
  answers: [{
    question: String,
    selected: String,
    correct: String,
    is_correct: Boolean,
    topic: String
  }],
  topics_covered: [String],
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'mcq_scores'
});

// Index for faster queries
mcqScoreSchema.index({ user_id: 1, created_at: -1 });
mcqScoreSchema.index({ session_id: 1, created_at: -1 });

// Virtual for pass/fail status
mcqScoreSchema.virtual('passed').get(function() {
  return this.score_percentage >= 60;
});

// Calculate score percentage before saving
mcqScoreSchema.pre('save', function(next) {
  if (this.isModified('correct_answers') || this.isModified('total_questions')) {
    this.score_percentage = Math.round((this.correct_answers / this.total_questions) * 100);
  }
  next();
});

const MCQScore = mongoose.model('MCQScore', mcqScoreSchema);

export default MCQScore;
