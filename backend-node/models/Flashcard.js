import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
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
  deck_name: {
    type: String,
    required: true,
    default: 'Study Deck'
  },
  cards: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    times_reviewed: {
      type: Number,
      default: 0
    },
    last_reviewed: {
      type: Date
    },
    next_review: {
      type: Date
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'flashcards'
});

flashcardSchema.index({ user_id: 1, created_at: -1 });
flashcardSchema.index({ session_id: 1 });

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

export default Flashcard;
