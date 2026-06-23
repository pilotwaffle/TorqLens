/**
 * TorqLens — shared domain types.
 * Kept provider-agnostic: nothing here references any AI vendor.
 */

export type PlantCategory =
  | "grass"
  | "weed"
  | "flower"
  | "shrub"
  | "tree"
  | "succulent"
  | "other";

export type Confidence = "high" | "medium" | "low";

export interface PlantCandidate {
  category: PlantCategory;
  commonName: string;
  scientificName: string;
  shortDescription: string;
  keyTraits: string[];
  confidence: Confidence;
  /** Numeric match score 0–100 for display ("94% match"). Derived from confidence/rank. */
  matchPercent: number;
  careNote: string;
  reason: string;
}

export interface IdentifyResult {
  identified: boolean;
  isPlant: boolean;
  primary: PlantCandidate | null;
  candidates: PlantCandidate[];
}

/** Guidance action. UI rule: always "Remove safely" — never aggressive wording. */
export type GuidanceAction = "grow" | "remove";

export interface GuidanceResult {
  action: GuidanceAction;
  commonName: string;
  scientificName: string;
  /** Markdown body. */
  content: string;
}

/** A scan persisted on-device (history + favorites). No image bytes leave the device beyond identification. */
export interface ScanRecord {
  id: string;
  /** epoch ms */
  createdAt: number;
  /** Compressed JPEG data URL thumbnail, stored locally only. */
  thumbnail: string;
  primary: PlantCandidate;
  candidates: PlantCandidate[];
  favorite: boolean;
}

export const CATEGORY_LABEL: Record<PlantCategory, string> = {
  grass: "Grass",
  weed: "Weed",
  flower: "Flower",
  shrub: "Shrub",
  tree: "Tree",
  succulent: "Succulent",
  other: "Plant",
};
