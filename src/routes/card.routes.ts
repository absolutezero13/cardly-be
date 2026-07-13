import { Router, type RequestHandler } from "express";
import multer from "multer";

import {
  createCard,
  deleteCard,
  getCard,
  listCards,
  scanCard,
  updateCard,
} from "../controllers/card.controller";
import { requireDb } from "../middleware/requireDb";
import { verifyIdToken } from "../middleware/verifyIdToken";

const MAX_CARD_IMAGE_BYTES = Number(
  process.env.MAX_CARD_IMAGE_BYTES ?? 2 * 1024 * 1024,
);

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_CARD_IMAGE_BYTES,
    files: 2,
  },
  fileFilter: (_request, file, callback) => {
    if (!allowedImageTypes.has(file.mimetype.toLowerCase())) {
      callback(
        new Error("Only JPEG, PNG, WebP, HEIC, and HEIF images are supported"),
      );
      return;
    }

    callback(null, true);
  },
});

const uploadCardImages: RequestHandler = (request, response, next) => {
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ])(request, response, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        response.status(413).json({
          error: `Each card image must be ${MAX_CARD_IMAGE_BYTES} bytes or smaller.`,
          code: "CARD_IMAGE_TOO_LARGE",
        });
        return;
      }

      response.status(400).json({
        error: "Invalid card image upload",
        code: "INVALID_CARD_UPLOAD",
      });
      return;
    }

    if (error) {
      response.status(415).json({
        error: error instanceof Error ? error.message : "Unsupported image",
        code: "UNSUPPORTED_CARD_IMAGE",
      });
      return;
    }

    next();
  });
};

const cardRouter = Router();

cardRouter.use(verifyIdToken);
cardRouter.post("/cards/scan", uploadCardImages, scanCard);
cardRouter.post("/cards", requireDb, createCard);
cardRouter.get("/cards", requireDb, listCards);
cardRouter.get("/cards/:cardId", requireDb, getCard);
cardRouter.patch("/cards/:cardId", requireDb, updateCard);
cardRouter.delete("/cards/:cardId", requireDb, deleteCard);

export default cardRouter;
