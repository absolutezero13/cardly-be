import type { Request, Response } from "express";

import {
  analyzeCard,
  CardNotIdentifiedError,
  InvalidGeminiResponseError,
  isGeminiUnavailableError,
} from "../services/cardAnalysis.service";

type CardUploadRequest = Request & {
  files?: {
    front?: Express.Multer.File[];
    back?: Express.Multer.File[];
  };
};

export const scanCard = async (
  request: CardUploadRequest,
  response: Response,
): Promise<void> => {
  const front = request.files?.front?.[0];
  const back = request.files?.back?.[0];

  if (!front || !back) {
    response.status(400).json({
      error: "Both front and back card images are required",
      code: "CARD_IMAGES_REQUIRED",
    });
    return;
  }

  try {
    const result = await analyzeCard(front, back);
    response.status(200).json(result);
  } catch (error) {
    if (error instanceof CardNotIdentifiedError) {
      response.status(422).json({
        error: error.message,
        code: "CARD_NOT_IDENTIFIED",
      });
      return;
    }

    if (isGeminiUnavailableError(error)) {
      response.status(503).json({
        error: "Card analysis is temporarily unavailable",
        code: "CARD_ANALYSIS_UNAVAILABLE",
      });
      return;
    }

    if (error instanceof InvalidGeminiResponseError) {
      console.error("Gemini returned an invalid card analysis:", error.message);
      response.status(502).json({
        error: "Card analysis returned an invalid response",
        code: "INVALID_CARD_ANALYSIS",
      });
      return;
    }

    console.error(
      "Card analysis failed:",
      error instanceof Error ? error.message : error,
    );
    response.status(500).json({
      error: "Failed to analyze card",
      code: "CARD_ANALYSIS_FAILED",
    });
  }
};
