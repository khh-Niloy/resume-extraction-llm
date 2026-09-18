import { z } from "zod";

const nullableString = z.string().trim().nullable();
export const resumeExtractionSchema = z
  .object({
    fullName: nullableString,
    email: nullableString,
    phone: nullableString,
    location: nullableString,
    summary: nullableString,
    skills: z.array(z.string().trim()),
    experience: z.array(
      z
        .object({
          company: nullableString,
          position: nullableString,
          startDate: nullableString,
          endDate: nullableString,
          description: nullableString,
        })
        .strict(),
    ),
    education: z.array(
      z
        .object({
          institution: nullableString,
          degree: nullableString,
          fieldOfStudy: nullableString,
          startDate: nullableString,
          endDate: nullableString,
        })
        .strict(),
    ),
    certifications: z.array(z.string().trim()),
    links: z.array(
      z.object({ label: z.string().trim(), url: z.string().trim() }).strict(),
    ),
    rawText: z.string(),
  })
  .strict();

export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>;

// Gemini's supported JSON-Schema subset. Runtime output is validated above too.
export const resumeResponseJsonSchema = {
  type: "object",
  properties: {
    fullName: { type: ["string", "null"] },
    email: { type: ["string", "null"] },
    phone: { type: ["string", "null"] },
    location: { type: ["string", "null"] },
    summary: { type: ["string", "null"] },
    skills: { type: "array", items: { type: "string" } },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: ["string", "null"] },
          position: { type: ["string", "null"] },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
          description: { type: ["string", "null"] },
        },
        required: [
          "company",
          "position",
          "startDate",
          "endDate",
          "description",
        ],
        additionalProperties: false,
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: ["string", "null"] },
          degree: { type: ["string", "null"] },
          fieldOfStudy: { type: ["string", "null"] },
          startDate: { type: ["string", "null"] },
          endDate: { type: ["string", "null"] },
        },
        required: [
          "institution",
          "degree",
          "fieldOfStudy",
          "startDate",
          "endDate",
        ],
        additionalProperties: false,
      },
    },
    certifications: { type: "array", items: { type: "string" } },
    links: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, url: { type: "string" } },
        required: ["label", "url"],
        additionalProperties: false,
      },
    },
    rawText: { type: "string" },
  },
  required: [
    "fullName",
    "email",
    "phone",
    "location",
    "summary",
    "skills",
    "experience",
    "education",
    "certifications",
    "links",
    "rawText",
  ],
  additionalProperties: false,
} as const;
