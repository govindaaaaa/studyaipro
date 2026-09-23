import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  item_type: {
    type: String,
    enum: ['session', 'note', 'flashcard', 'chat'],
    required: true
  },
  item_id: {
    type: String,
    required: true
  },
  session_id: {
    type: String
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  tags: [String],
  folder: {
    type: String,
    default: 'General'
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true,
  collection: 'bookmarks'
});

bookmarkSchema.index({ user_id: 1, item_type: 1 });
bookmarkSchema.index({ user_id: 1, folder: 1 });
bookmarkSchema.index({ user_id: 1, tags: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

export default Bookmark;
