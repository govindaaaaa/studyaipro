import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const chatHistorySchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    session_id: {
      type: String,
      required: true,
      // index: true removed here because it's covered by the compound index below
    },
    messages: {
      type: [messageSchema],
      default: [],
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "chat_history",
  },
);

// Update the updated_at timestamp before saving
chatHistorySchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Index for faster queries (this covers session_id indexing efficiently)
chatHistorySchema.index({ user_id: 1, session_id: 1 });
chatHistorySchema.index({ session_id: 1, created_at: -1 });

// Method to add a message
chatHistorySchema.methods.addMessage = function (role, content) {
  this.messages.push({
    role,
    content,
    timestamp: new Date(),
  });
  return this.save();
};

// Method to get recent messages
chatHistorySchema.methods.getRecentMessages = function (limit = 10) {
  return this.messages.slice(-limit);
};

// Method to clear chat history
chatHistorySchema.methods.clearMessages = function () {
  this.messages = [];
  return this.save();
};

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;
