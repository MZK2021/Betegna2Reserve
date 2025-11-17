import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { roomsRouter } from "./routes/rooms";
import { feedbackRouter } from "./routes/feedback";
import { adsRouter } from "./routes/ads";
import { messagesRouter } from "./routes/messages";
import { adminRouter } from "./routes/admin";

const app = express();

// CORS - Allow all origins for local development
app.use(cors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["*"],
  credentials: false, // Set to false when using origin: "*"
}));

// Disable helmet for easier local testing
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" },
// }));

// Increase body size limit to handle base64 image uploads (up to 3 images)
app.use(express.json({ limit: "20mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/", apiLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "betegna-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/ads", adsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/admin", adminRouter);

export default app;


