/**
 * TorqLens — on-device storage for scan history & favorites.
 *
 * Uses Capacitor Preferences on native (persists in the iOS keystore-backed
 * store) and falls back to localStorage on web. NOTHING here is sent to a
 * server — history and favorites live only on the user's device, which is what
 * the privacy copy promises.
 */
import { Preferences } from "@capacitor/preferences";
import type { ScanRecord } from "./types";

const HISTORY_KEY = "torqlens.history.v1";
const ONBOARDED_KEY = "torqlens.onboarded.v1";
const MAX_HISTORY = 200;

async function getRaw(key: string): Promise<string | null> {
  try {
    const { value } = await Preferences.get({ key });
    return value ?? null;
  } catch {
    if (typeof localStorage !== "undefined") return localStorage.getItem(key);
    return null;
  }
}

async function setRaw(key: string, value: string): Promise<void> {
  try {
    await Preferences.set({ key, value });
  } catch {
    if (typeof localStorage !== "undefined") localStorage.setItem(key, value);
  }
}

export async function getHistory(): Promise<ScanRecord[]> {
  const raw = await getRaw(HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ScanRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeHistory(records: ScanRecord[]): Promise<void> {
  await setRaw(HISTORY_KEY, JSON.stringify(records.slice(0, MAX_HISTORY)));
}

/** Prepend a scan to history (most-recent first). Returns the updated list. */
export async function addScan(record: ScanRecord): Promise<ScanRecord[]> {
  const history = await getHistory();
  const next = [record, ...history.filter((r) => r.id !== record.id)];
  await writeHistory(next);
  return next;
}

export async function removeScan(id: string): Promise<ScanRecord[]> {
  const history = await getHistory();
  const next = history.filter((r) => r.id !== id);
  await writeHistory(next);
  return next;
}

export async function toggleFavorite(id: string): Promise<ScanRecord[]> {
  const history = await getHistory();
  const next = history.map((r) =>
    r.id === id ? { ...r, favorite: !r.favorite } : r
  );
  await writeHistory(next);
  return next;
}

export async function getFavorites(): Promise<ScanRecord[]> {
  return (await getHistory()).filter((r) => r.favorite);
}

export async function clearHistory(): Promise<void> {
  await writeHistory([]);
}

export async function hasOnboarded(): Promise<boolean> {
  return (await getRaw(ONBOARDED_KEY)) === "1";
}

export async function setOnboarded(): Promise<void> {
  await setRaw(ONBOARDED_KEY, "1");
}

/** Generate a unique id without Date.now nondeterminism concerns in callers. */
export function newId(seed: number): string {
  return `scan_${seed.toString(36)}_${Math.floor(seed % 1000)}`;
}
