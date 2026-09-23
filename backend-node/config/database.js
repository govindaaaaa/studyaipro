import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGODB_URL) {
    console.error("[DB] FATAL ERROR: MONGODB_URL is not defined!");
    process.exit(1);
  }

  try {
    // Safely mask the password for logging so we can see the format
    const maskedUrl = process.env.MONGODB_URL.replace(/:([^:@]+)@/, ":****@");
    console.log("[DB] Inspecting MONGODB_URL format:", maskedUrl);

    console.log(`[DB] Connecting strictly to MongoDB Atlas...`);

    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      dbName: process.env.DB_NAME || "studyai_pro",
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });

    console.log(`[DB] MongoDB Connected: ${conn.connection.host}`);
    console.log(`[DB] Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[DB] Atlas Connection Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("[DB] MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error(`[DB] MongoDB error: ${err}`);
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("[DB] MongoDB connection closed through app termination");
  process.exit(0);
});

export default connectDB;
