import cors from "cors";
import express, { type Express } from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import resumeRouter from "./routes/resume.routes.js";

export function createApp(): Express {
  const app = express();
  app.use(cors({ origin: env.frontendOrigin }));
  app.use(express.json());
  app.get("/health", (_request, response) => response.json({ ok: true }));
  app.use("/api/resumes", resumeRouter);
  app.use(errorHandler);
  return app;
}
