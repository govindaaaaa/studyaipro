import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Resolve directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the current directory (or adjust path if it's one folder up)
dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";

// Import routes
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import chatRoutes from "./routes/chat.js";
import notesRoutes from "./routes/notes.js";
import mcqRoutes from "./routes/mcq.js";
import explainRoutes from "./routes/explain.js";
import processRoutes from "./routes/process.js";
import outputRoutes from "./routes/output.js";

// NEW PREMIUM FEATURES
import flashcardsRoutes from "./routers/flashcards.js";
import analyticsRoutes from "./routers/analytics.js";
import bookmarksRoutes from "./routers/bookmarks.js";
import studySessionsRoutes from "./routers/study-sessions.js";
import summaryRoutes from "./routers/summary.js";
import exportRoutes from "./routers/export.js";
import searchRoutes from "./routers/search.js";
import tutorRoutes from "./routers/tutor.js";
import tagsRoutes from "./routers/tags.js";
import shareRoutes from "./routers/share.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/auth", authRoutes);
app.use("/upload", uploadRoutes);
app.use("/chat", chatRoutes);
app.use("/notes", notesRoutes);
app.use("/mcq", mcqRoutes);
app.use("/explain", explainRoutes);
app.use("/process", processRoutes);
app.use("/output", outputRoutes);

// NEW PREMIUM FEATURES ROUTES
app.use("/flashcards", flashcardsRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/bookmarks", bookmarksRoutes);
app.use("/study-sessions", studySessionsRoutes);
app.use("/summary", summaryRoutes);
app.use("/export", exportRoutes);
app.use("/search", searchRoutes);
app.use("/tutor", tutorRoutes);
app.use("/tags", tagsRoutes);
app.use("/share", shareRoutes);

// Health check routes
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "StudyAI Pro API v1.0 (MERN)",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server after connecting to Database
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[SERVER] Running on http://localhost:${PORT}`);
      console.log(`[ENV] Mode: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error(
      "[SERVER] Failed to start due to database connection error:",
      error.message,
    );
    process.exit(1);
  }
};

startServer();

export default app;
