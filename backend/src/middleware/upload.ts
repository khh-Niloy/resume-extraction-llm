import multer from "multer";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_BYTES,
} from "../config/constants.js";

export const uploadResumeImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_request, file, callback) =>
    callback(null, ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)),
}).single("resume");
