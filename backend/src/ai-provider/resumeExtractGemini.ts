import { gemini } from "../config/clients.js";
import { env } from "../config/env.js";
import {
  resumeExtractionSchema,
  resumeResponseJsonSchema,
} from "../schemas/resume.schema.js";
import { extractionPrompt } from "../helpers/prompt.js";
import type { ResumeExtraction } from "../schemas/resume.schema.js";

export async function resumeExtractGemini(
  file: Express.Multer.File,
): Promise<ResumeExtraction> {
  try {
    const result = await gemini.models.generateContent({
      model: env.geminiModel,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: file.mimetype,
                data: file.buffer.toString("base64"),
              },
            },
            { text: extractionPrompt },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: resumeResponseJsonSchema as never,
      },
    });

    if (!result.text) {
      throw new Error("Gemini returned an empty extraction response.");
    }

    return resumeExtractionSchema.parse(JSON.parse(result.text));
  } catch (error: any) {
    console.error("Resume Extraction Error:", error);
    throw new Error(
      `Failed to extract resume details: ${error?.message || "Unknown error during AI extraction"}`,
    );
  }
}
