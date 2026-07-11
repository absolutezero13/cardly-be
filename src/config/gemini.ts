import { GoogleGenerativeAI } from "@google/generative-ai";

export const CARD_ANALYSIS_MODEL =
  process.env.GEMINI_CARD_ANALYSIS_MODEL ?? "gemini-2.5-flash-lite";

export const getGeminiClient = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  return new GoogleGenerativeAI(apiKey);
};
