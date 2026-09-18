import type { ErrorRequestHandler } from "express";
import multer from "multer";
import { AppError } from "../helpers/app-error.js";

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  request,
  response,
  _next,
) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE")
    return response
      .status(413)
      .json({ error: "The image must be 10 MB or smaller." });
  console.error("Unhandled request error", {
    path: request.path,
    message: error instanceof Error ? error.message : error,
  });
  if (error instanceof AppError)
    return response.status(error.statusCode).json({ error: error.message });
  return response
    .status(500)
    .json({ error: "We could not process that resume. Please try again." });
};
