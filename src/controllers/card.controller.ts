import type { Request, Response } from "express";
import { Error as MongooseError } from "mongoose";

import { CardModel } from "../models/card.model";
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

const handleCardDatabaseError = (
  response: Response,
  error: unknown,
  action: string,
): void => {
  if (
    error instanceof MongooseError.ValidationError ||
    error instanceof MongooseError.CastError
  ) {
    response.status(400).json({ error: error.message });
    return;
  }

  console.error(`Failed to ${action} card:`, error);
  response.status(500).json({ error: `Failed to ${action} card` });
};

export const createCard = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const {
      ownerId,
      collectionId,
      name,
      setName,
      rarity,
      price,
      confidence,
      frontImageUrl,
      backImageUrl,
    } = request.body;

    const card = await CardModel.create({
      ownerId,
      collectionId,
      name,
      setName,
      rarity,
      price,
      confidence,
      frontImageUrl,
      backImageUrl,
    });

    response.status(201).json(card);
  } catch (error) {
    handleCardDatabaseError(response, error, "create");
  }
};

export const listCards = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const ownerId = request.query.ownerId as string;
    const collectionId = request.query.collectionId as string | undefined;
    const filter =
      collectionId === undefined
        ? { ownerId }
        : {
            ownerId,
            collectionId: collectionId === "null" ? null : collectionId,
          };

    const cards = await CardModel.find(filter).sort({ createdAt: -1 });

    response.status(200).json(cards);
  } catch (error) {
    handleCardDatabaseError(response, error, "list");
  }
};

export const getCard = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const ownerId = request.query.ownerId as string;
    const { cardId } = request.params;
    const card = await CardModel.findOne({ _id: cardId, ownerId });

    if (!card) {
      response.status(404).json({ error: "Card not found" });
      return;
    }

    response.status(200).json(card);
  } catch (error) {
    handleCardDatabaseError(response, error, "get");
  }
};

export const updateCard = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const ownerId = request.query.ownerId as string;
    const { cardId } = request.params;
    const {
      collectionId,
      name,
      setName,
      rarity,
      price,
      confidence,
      frontImageUrl,
      backImageUrl,
    } = request.body;

    const card = await CardModel.findOneAndUpdate(
      { _id: cardId, ownerId },
      {
        $set: {
          collectionId,
          name,
          setName,
          rarity,
          price,
          confidence,
          frontImageUrl,
          backImageUrl,
        },
      },
      { returnDocument: "after", runValidators: true },
    );

    if (!card) {
      response.status(404).json({ error: "Card not found" });
      return;
    }

    response.status(200).json(card);
  } catch (error) {
    handleCardDatabaseError(response, error, "update");
  }
};

export const deleteCard = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const ownerId = request.query.ownerId as string;
    const { cardId } = request.params;
    const card = await CardModel.findOneAndDelete({ _id: cardId, ownerId });

    if (!card) {
      response.status(404).json({ error: "Card not found" });
      return;
    }

    response.status(204).send();
  } catch (error) {
    handleCardDatabaseError(response, error, "delete");
  }
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
