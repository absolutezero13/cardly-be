import { Schema, model, type InferSchemaType } from "mongoose";

import { CARD_RARITIES } from "../types/cardAnalysis";

const cardSchema = new Schema(
  {
    ownerId: {
      type: String,
      required: true,
      trim: true,
    },
    collectionId: {
      type: Schema.Types.ObjectId,
      ref: "UserCollection",
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    setName: {
      type: String,
      required: true,
      trim: true,
    },
    rarity: {
      type: String,
      required: true,
      enum: CARD_RARITIES,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    frontImageUrl: {
      type: String,
      trim: true,
      default: null,
    },
    backImageUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "cards",
  },
);

cardSchema.index({ ownerId: 1, createdAt: -1 });
cardSchema.index({ ownerId: 1, collectionId: 1 });
cardSchema.index({ ownerId: 1, isFavorite: 1 });

export type Card = InferSchemaType<typeof cardSchema>;

export const CardModel = model("Card", cardSchema);
