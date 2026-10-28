import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';

dotenv.config();

import connectDB from './configs/db.js';
import userRoutes from './routes/userRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import errorHandler from './middleware/errorhandler.js';
import jobsRoutes from './routes/jobsRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import { generalApiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security Headers with Cross-Origin Resource Policy enabled for assets
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Request body size limits (prevents payload flood attacks)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Environment-aware CORS configuration
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  "tauri://localhost",
  "http://tauri.localhost",
  "https://jobone-v1.vercel.app",
  "https://jobone.vercel.app",
];

const envAllowed = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : []),
].filter(Boolean).map(url => url.trim().replace(/\/+$/, ""));

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowed])];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.trim().replace(/\/+$/, "");

    // In development mode, allow any localhost/127.0.0.1 origin
    if (process.env.NODE_ENV !== "production") {
      if (/^https?:\/\/localhost(:\d+)?$/.test(normalizedOrigin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalizedOrigin)) {
        return callback(null, true);
      }
    }

    // Allow explicitly configured origins (case-insensitive check)
    if (allowedOrigins.some(o => o.toLowerCase() === normalizedOrigin.toLowerCase())) {
      return callback(null, true);
    }

    // Automatically allow any Vercel deployment (jobone-v1, preview branches, production)
    if (/^https?:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // Automatically allow Render deployments
    if (/^https?:\/\/[a-zA-Z0-9_-]+\.onrender\.com$/.test(normalizedOrigin)) {
      return callback(null, true);
    }

    // Return false without throwing an unhandled Error (which avoids 500 crashes)
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// General abuse limiter across public API
app.use("/jobs", generalApiLimiter);
app.use("/applications", generalApiLimiter);

//---------------------------MAIN-ROUTES---------------------------------------//
app.use("/user", userRoutes);
app.use("/contact", contactRoutes);
app.use("/jobs", jobsRoutes);
app.use("/applications", applicationRoutes);
app.use("/employer", employerRoutes);
app.use("/ai", aiRoutes);
app.use("/images", imageRoutes);
app.use("/admin", adminRoutes);
//---------------------------MAIN-ROUTES---------------------------------------//

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Controlled Database Startup & Graceful Shutdown
const startServer = async () => {
  try {
    // 1. Connect to database first (eliminate startup race condition)
    await connectDB();
    console.log("MongoDB connection verified.");

    // 2. Start HTTP server only after DB is ready
    const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

    // 3. Graceful shutdown handler
    const gracefulShutdown = (signal) => {
      console.log(`Received ${signal}. Closing server gracefully...`);
      server.close(async () => {
        try {
          await mongoose.connection.close(false);
          console.log("MongoDB connection closed cleanly.");
          process.exit(0);
        } catch (err) {
          console.error("Error during connection teardown:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("Database connection failed. Server startup aborted:", error.message);
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception thrown:", error);
  process.exit(1);
});

startServer();

