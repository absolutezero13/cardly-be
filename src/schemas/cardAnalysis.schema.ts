import { SchemaType, type ResponseSchema } from "@google/generative-ai";

import { CARD_RARITIES } from "../types/cardAnalysis";

export const CARD_ANALYSIS_RESPONSE_SCHEMA: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    identified: {
      type: SchemaType.BOOLEAN,
      description:
        "Whether both images clearly show the front and back of the same identifiable trading card.",
    },
    errorReason: {
      type: SchemaType.STRING,
      nullable: true,
      description: "A concise reason when the card cannot be identified.",
    },
    name: {
      type: SchemaType.STRING,
      nullable: true,
      description:
        "The card or featured subject name, including the variant when visible.",
    },
    setName: {
      type: SchemaType.STRING,
      nullable: true,
      description:
        "The printed trading-card set or release name and year when visible.",
    },
    rarity: {
      type: SchemaType.STRING,
      format: "enum",
      nullable: true,
      enum: [...CARD_RARITIES],
      description: "The closest normalized rarity tier.",
    },
    price: {
      type: SchemaType.NUMBER,
      nullable: true,
      description:
        "A conservative estimated ungraded market value in US dollars based only on the identified card.",
    },
    confidence: {
      type: SchemaType.NUMBER,
      description: "Identification confidence from 0 through 1.",
    },
  },
  required: [
    "identified",
    "errorReason",
    "name",
    "setName",
    "rarity",
    "price",
    "confidence",
  ],
};
