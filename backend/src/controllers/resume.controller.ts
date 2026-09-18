import crypto from "node:crypto";
import type { RequestHandler } from "express";
import { z } from "zod";
import { createResume, getResumeProfile } from "../services/resume.service.js";

export const uploadResume: RequestHandler = async (request, response, next) => {
  const requestId = crypto.randomUUID();
  const file = request.file;
  try {
    return response.status(201).json(await createResume(file));
  } catch (error) {
    console.error(
      `[${requestId}] resume processing failed`,
      error instanceof Error ? error.message : error,
    );
    return next(error);
  }
};

export const readResumeProfile: RequestHandler = async (
  request,
  response,
  next,
) => {
  try {
    const { resumeId } = request.params;
    const accessToken = request.query.token;
    if (
      typeof resumeId !== "string" ||
      typeof accessToken !== "string" ||
      !z.uuid().safeParse(resumeId).success ||
      !z.uuid().safeParse(accessToken).success
    )
      return response.status(400).json({ error: "Invalid profile link." });
    return response.json(await getResumeProfile(resumeId, accessToken));
  } catch (error) {
    return next(error);
  }
};
