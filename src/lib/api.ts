/**
 * TorqLens — backend client.
 *
 * The app calls the REMOTE BACKEND ONLY. No API keys, secrets, or provider
 * names live here. The base URL is injected at build time via
 * NEXT_PUBLIC_API_BASE_URL (empty string ⇒ same-origin, used by the web app).
 * The iOS bundle points this at the deployed backend.
 */
import type { IdentifyResult, GuidanceAction, GuidanceResult } from "./types";

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");

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
