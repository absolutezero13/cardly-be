export const CARD_RARITIES = [
  "common",
  "uncommon",
  "rare",
  "mythic",
] as const;

export type CardRarity = (typeof CARD_RARITIES)[number];

export type CardAnalysisResult = {
  id: string;
  name: string;
  setName: string;
  rarity: CardRarity;
  price: number;
  confidence: number;
};

export type GeminiCardAnalysis = {
  identified: boolean;
  errorReason: string | null;
  name: string | null;
  setName: string | null;
  rarity: CardRarity | null;
  price: number | null;
  confidence: number;
};
