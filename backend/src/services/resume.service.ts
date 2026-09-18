import crypto from "node:crypto";
import { supabase } from "../config/clients.js";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  RESUME_BUCKET,
} from "../config/constants.js";
import { env } from "../config/env.js";
import { AppError } from "../helpers/app-error.js";
import { resumeExtractGemini } from "../ai-provider/resumeExtractGemini.js";

export async function createResume(
  file: Express.Multer.File | undefined,
): Promise<{ resumeId: string; accessToken: string }> {
  if (!file || !ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    throw new AppError("Upload a JPEG, PNG, or WebP resume image.", 400);
  }

  const id = crypto.randomUUID();
  const accessToken = crypto.randomUUID();
  const extension =
    file.mimetype === "image/jpeg"
      ? "jpeg"
      : file.mimetype === "image/png"
        ? "png"
        : "webp";
  const storagePath = `${id}/resume.${extension}`;

  try {
    // insert into db
    const { error: createError } = await supabase.from("resumes").insert({
      id,
      access_token: accessToken,
      storage_path: storagePath,
      original_filename:
        file.originalname.slice(0, 255) || `resume.${extension}`,
      mime_type: file.mimetype,
      status: "processing",
    });
    if (createError) throw createError;

    // file upload
    const { error: uploadError } = await supabase.storage
      .from(RESUME_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) throw uploadError;

    // extract data from resume
    const extractedData = await resumeExtractGemini(file);

    // update resume with extracted data
    const { error: updateError } = await supabase
      .from("resumes")
      .update({
        status: "ready",
        extracted_data: extractedData,
        extraction_model: env.geminiModel,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw updateError;
    return { resumeId: id, accessToken };
  } catch (error) {
    await supabase.storage.from(RESUME_BUCKET).remove([storagePath]);

    await supabase
      .from("resumes")
      .update({
        status: "failed",
        error_message:
          "Extraction failed. Please upload a clearer image and try again.",
      })
      .eq("id", id);
    throw error;
  }
}

export async function getResumeProfile(id: string, accessToken: string) {
  const { data: resume, error } = await supabase
    .from("resumes")
    .select(
      "id, storage_path, original_filename, status, extracted_data, created_at",
    )
    .eq("id", id)
    .eq("access_token", accessToken)
    .maybeSingle();

  if (error) throw error;
  if (!resume) throw new AppError("Profile not found.", 404);
  if (resume.status !== "ready")
    throw new AppError("This resume is not ready yet. Please try again.", 409);

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(resume.storage_path, 600);
  if (signedUrlError) throw signedUrlError;

  return {
    id: resume.id,
    imageUrl: signedUrl.signedUrl,
    originalFilename: resume.original_filename,
    extractedData: resume.extracted_data,
    createdAt: resume.created_at,
  };
}
