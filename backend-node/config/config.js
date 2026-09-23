import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: "../backend/.env" });

export const config = {
  // Server
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongodbUrl: process.env.MONGODB_URL,
  dbName: process.env.DB_NAME || "studyai_pro",

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE_MINUTES || 10080, // 7 days default

  // Groq API
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b", // NEW: Groq's GPT model (Jan 2025)

  // RAG Microservice
  ragServiceUrl: process.env.RAG_SERVICE_URL || "http://localhost:8001",

  // File Upload
  maxFileSize: 20 * 1024 * 1024, // 20MB
  allowedExtensions: [".pdf", ".txt", ".md"],

  // Text Processing
  chunkSize: parseInt(process.env.CHUNK_SIZE) || 800,
  chunkOverlap: parseInt(process.env.CHUNK_OVERLAP) || 100,

  // Email (Nodemailer)
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  emailFrom: process.env.EMAIL_FROM,

  // Twilio
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM,

  // Cloudinary (optional)
  cloudinaryUrl: process.env.CLOUDINARY_URL,
};

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URL", "JWT_SECRET", "GROQ_API_KEY"];

export const validateConfig = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `[CONFIG] Missing required environment variables: ${missing.join(", ")}`,
    );
    console.error("[CONFIG] Please check your .env file");
    process.exit(1);
  }

  console.log("[CONFIG] All required environment variables loaded");
};

export default config;
