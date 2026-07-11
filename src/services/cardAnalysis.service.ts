import { randomUUID } from "node:crypto";

import { GoogleGenerativeAIFetchError, type Part } from "@google/generative-ai";

import { CARD_ANALYSIS_MODEL, getGeminiClient } from "../config/gemini";
import { CARD_ANALYSIS_RESPONSE_SCHEMA } from "../schemas/cardAnalysis.schema";
import type {
  CardAnalysisResult,
  GeminiCardAnalysis,
} from "../types/cardAnalysis";

export class CardNotIdentifiedError extends Error {}

export class InvalidGeminiResponseError extends Error {}

export const isGeminiUnavailableError = (error: unknown): boolean =>
  error instanceof GoogleGenerativeAIFetchError &&
  (error.status === 429 || error.status === 503);

const ANALYSIS_PROMPT = `Analyze these two images in order: first the FRONT, then the BACK of one trading card.

Use visible evidence from both sides, including the subject/player/character, year, manufacturer, set, card number, parallel or variant markings, and printed rarity. Do not invent an identity from a blurry or incomplete image. Set identified to false when the images are not a trading card, show different cards, or do not contain enough evidence for a reliable identification.

Normalize rarity to common, uncommon, rare, or mythic. Estimate price as a conservative ungraded value in USD; this is an estimate, not a live market quote. Return only the structured response.`;

const imagePart = (file: Express.Multer.File): Part => ({
  inlineData: {
    data: file.buffer.toString("base64"),
    mimeType: file.mimetype,
  },
});

const parseResult = (text: string): CardAnalysisResult => {
  let value: GeminiCardAnalysis;

  try {
    value = JSON.parse(text) as GeminiCardAnalysis;
  } catch {
    throw new InvalidGeminiResponseError("Gemini returned invalid JSON");
  }

  if (value.identified !== true) {
    throw new CardNotIdentifiedError(
      value.errorReason ?? "The card could not be identified from these images",
    );
  }

  if (
    value.name === null ||
    value.setName === null ||
    value.rarity === null ||
    value.price === null
  ) {
    throw new InvalidGeminiResponseError(
      "Gemini returned an incomplete card analysis",
    );
  }

  return {
    id: `scan-${randomUUID()}`,
    name: value.name,
    setName: value.setName,
    rarity: value.rarity,
    price: value.price,
    confidence: value.confidence,
  };
};

export const analyzeCard = async (
  front: Express.Multer.File,
  back: Express.Multer.File,
): Promise<CardAnalysisResult> => {
  const model = getGeminiClient().getGenerativeModel({
    model: CARD_ANALYSIS_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: CARD_ANALYSIS_RESPONSE_SCHEMA,
    },
  });

  const response = await model.generateContent([
    ANALYSIS_PROMPT,
    imagePart(front),
    imagePart(back),
  ]);

  return parseResult(response.response.text());
};
