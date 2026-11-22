/**
 * One-time StoreKit review prompt after enough successful scan saves.
 *
 * Pure: storage and the native request are injected so this can run under
 * node:test with no device and no Capacitor. Apple still rate-limits the
 * system sheet; this module only decides whether to ask once.
 */

export const REVIEW_SAVE_THRESHOLD = 3;
export const REVIEW_SAVE_COUNT_KEY = "torqlens.successfulSaveCount.v1";
export const REVIEW_PROMPTED_KEY = "torqlens.reviewPrompted.v1";

export interface ReviewPromptStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

/** Serializes overlapping saves so they cannot double-increment or double-prompt. */
let tail: Promise<void> = Promise.resolve();

export async function maybeRequestReviewAfterSuccessfulSave(opts: {
  storage: ReviewPromptStorage;
  requestReview: () => Promise<void>;
  /** History length after this save. Used only when the count key is missing or not an integer. */
  savedCountIfUntracked: number;
  threshold?: number;
}): Promise<{ requested: boolean; savedCount: number }> {
  const previous = tail;
  let release: () => void = () => {};
  tail = new Promise<void>((resolve) => {
    release = resolve;
  });
  try {
    // A rejected predecessor must not wedge the next save.
    await previous.catch(() => {});
    return await runReviewPrompt(opts);
  } catch {
    return { requested: false, savedCount: 0 };
  } finally {
    release();
  }
}

async function runReviewPrompt(opts: {
  storage: ReviewPromptStorage;
  requestReview: () => Promise<void>;
  savedCountIfUntracked: number;
  threshold?: number;
}): Promise<{ requested: boolean; savedCount: number }> {
  const threshold = opts.threshold ?? REVIEW_SAVE_THRESHOLD;
  let savedCount = 0;
  let countKnown = false;
  try {
    const raw = await opts.storage.get(REVIEW_SAVE_COUNT_KEY);
    const parsed = parseStoredCount(raw);
    if (parsed !== null) {
      savedCount = parsed + 1;
    } else {
      // Missing or non-numeric: seed from history length, do not increment again.
      savedCount = seedCount(opts.savedCountIfUntracked);
    }
    countKnown = true;

    try {
      await opts.storage.set(REVIEW_SAVE_COUNT_KEY, String(savedCount));
    } catch {
      return { requested: false, savedCount: countKnown ? savedCount : 0 };
    }

    if (savedCount < threshold) {
      return { requested: false, savedCount };
    }

    const prompted = await opts.storage.get(REVIEW_PROMPTED_KEY);
    if (prompted === "1") {
      return { requested: false, savedCount };
    }

    try {
      await opts.storage.set(REVIEW_PROMPTED_KEY, "1");
    } catch {
      // Leave the flag unset so a later save can still ask.
      return { requested: false, savedCount };
    }

    try {
      await opts.requestReview();
    } catch {
      // Flag stays set. A thrown native call must not surface to the save flow.
    }
    return { requested: true, savedCount };
  } catch {
    return { requested: false, savedCount: 0 };
  }
}

/** Integer >= 0 stored as a decimal string, or null when the key should be seeded. */
function parseStoredCount(raw: string | null): number | null {
  if (raw == null || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < 0) return null;
  return n;
}

function seedCount(savedCountIfUntracked: number): number {
  if (!Number.isFinite(savedCountIfUntracked) || savedCountIfUntracked <= 0) return 0;
  return Math.floor(savedCountIfUntracked);
}
