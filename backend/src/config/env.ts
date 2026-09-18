import "dotenv/config";

const requiredKeys = [
  "SUPABASE_URL",
  "SUPABASE_SECRET_KEY",
  "GEMINI_API_KEY",
] as const;
const missingKeys = requiredKeys.filter((key) => !process.env[key]);
if (missingKeys.length > 0)
  throw new Error(
    `Missing required environment variables: ${missingKeys.join(", ")}`,
  );

export const env = Object.freeze({
  port: Number(process.env.PORT ?? 5000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY!,
  geminiApiKey: process.env.GEMINI_API_KEY!,
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
});
