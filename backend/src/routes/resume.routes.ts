import { Router } from "express";
import {
  readResumeProfile,
  uploadResume,
} from "../controllers/resume.controller.js";
import { uploadResumeImage } from "../middleware/upload.js";

const router = Router();
router.post("/", uploadResumeImage, uploadResume);
router.get("/:resumeId", readResumeProfile);
export default router;
