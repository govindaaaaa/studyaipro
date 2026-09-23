import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    session_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    chunk_count: {
      type: Number,
      required: true,
      min: 0,
    },
    char_count: {
      type: Number,
      required: true,
      min: 0,
    },
    tags: [String],
    category: {
      type: String,
      default: 'General'
    },
    shared_with: [{
      user_email: String,
      permission: {
        type: String,
        enum: ['view', 'edit'],
        default: 'view'
      }
    }],
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "sessions",
  },
);

// Indexes for faster queries
// session_id already has unique: true which creates an index
sessionSchema.index({ user_id: 1, created_at: -1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
