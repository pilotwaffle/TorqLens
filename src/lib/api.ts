/**
 * TorqLens — backend client.
 *
 * The app calls the REMOTE BACKEND ONLY. No API keys, secrets, or provider
 * names live here. The base URL is injected at build time via
 * NEXT_PUBLIC_API_BASE_URL (empty string ⇒ same-origin, used by the web app).
 * The iOS bundle points this at the deployed backend.
 */
import { Capacitor } from "@capacitor/core";
import type { IdentifyResult, GuidanceAction, GuidanceResult } from "./types";

// Production backend. Used as the guaranteed fallback for the native app so a
// missing/empty build-time env var can never leave the iOS bundle pointing at
// its own (api-less) local origin.
const PROD_API_BASE = "https://torqlens.vercel.app";

function resolveApiBase(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
  // Native app: a relative/same-origin URL resolves to capacitor://localhost
  // (no API there). Always target the remote backend — env value if it's an
  // absolute http(s) URL, otherwise the production fallback.
  if (Capacitor.isNativePlatform()) {
    return /^https?:\/\//i.test(fromEnv) ? fromEnv : PROD_API_BASE;
  }
  // Web: empty = same-origin (correct for the deployed site).
  return fromEnv;
}

const API_BASE = resolveApiBase();

function url(path: string): string {
  return `${API_BASE}${path}`;
}

/** Friendly, user-safe error. We never surface raw backend/model errors. */
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const GENERIC_FAIL =
  "We couldn't analyze that photo. Please check your connection and try again with a clear, well-lit close-up.";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Network/transport failure — never expose internals.
    throw new ApiError(GENERIC_FAIL);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Use only the sanitized message the backend chooses to send; otherwise generic.
    const msg =
      data && typeof (data as { error?: unknown }).error === "string"
        ? (data as { error: string }).error
        : GENERIC_FAIL;
    throw new ApiError(msg);
  }
  return data as T;
}

/**
 * Identify a plant from a compressed JPEG data URL.
 * @param imageDataUrl `data:image/jpeg;base64,...`
 */
export function identifyPlant(imageDataUrl: string): Promise<IdentifyResult> {
  return postJson<IdentifyResult>("/api/identify", { image: imageDataUrl });
}

/** Fetch grow / remove-safely guidance for a candidate. */
export function fetchGuidance(params: {
  action: GuidanceAction;
  commonName: string;
  scientificName: string;
  category: string;
  shortDescription: string;
}): Promise<GuidanceResult> {
  return postJson<GuidanceResult>("/api/info", params);
}
