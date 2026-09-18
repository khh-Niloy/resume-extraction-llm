import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

export const supabase = createClient(env.supabaseUrl, env.supabaseSecretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
export const gemini = new GoogleGenAI({ apiKey: env.geminiApiKey });
