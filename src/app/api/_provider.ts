/**
 * Server-only identification provider adapter.
 *
 * This is the SINGLE boundary where the backend talks to the underlying AI
 * vision model (Claude Sonnet 4.6 via the Anthropic API). It is imported ONLY
 * by server route handlers (never by the client or the iOS bundle).
 *
 * Security:
 *   • The provider key (ANTHROPIC_API_KEY) is read from the server environment
 *     only — never bundled into the client and never placed in any
 *     NEXT_PUBLIC_* variable.
 *   • The model/provider name is never exported, logged, or surfaced to the
 *     client. Errors thrown here are caught by the route handlers and replaced
 *     with generic, user-safe messages before any response is returned.
 *
 * Operator: set ANTHROPIC_API_KEY in the BACKEND host's secret store
 * (e.g. Vercel → Project Settings → Environment Variables). Do not commit it.
 */
import Anthropic from "@anthropic-ai/sdk";

// Sonnet 4.6 — strong vision at a lower cost tier; chosen by the operator.
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      // Surfaced as a generic message by the route handler; never leaks the
      // variable name or provider to the client.
      throw new Error("provider not configured");
    }
    client = new Anthropic({ apiKey: apiKey.trim() });
  }
  return client;
}

type MediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

/** Split a `data:image/...;base64,...` URL into media type + raw base64. */
function parseDataUrl(dataUrl: string): { mediaType: MediaType; data: string } {
  const match = /^data:(image\/(?:jpeg|jpg|png|webp|gif));base64,(.+)$/i.exec(
    dataUrl.trim()
  );
  if (!match) {
    throw new Error("unsupported image payload");
  }
  const raw = match[1].toLowerCase();
  const mediaType: MediaType = raw === "image/jpg" ? "image/jpeg" : (raw as MediaType);
  return { mediaType, data: match[2] };
}

/** Concatenate all text blocks from a response into a single string. */
function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/**
 * Run a vision (image) identification request. Returns raw model text.
 * The prompt instructs the model to return JSON; parsing/validation happens
 * in the route handler.
 */
export async function visionComplete(
  promptText: string,
  imageDataUrl: string
): Promise<string> {
  const { mediaType, data } = parseDataUrl(imageDataUrl);
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType, data },
          },
          { type: "text", text: promptText },
        ],
      },
    ],
  });
  return textOf(message);
}

/** Run a text completion (guidance generation). Returns raw model text. */
export async function textComplete(
  systemText: string,
  userText: string
): Promise<string> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemText,
    messages: [{ role: "user", content: userText }],
  });
  return textOf(message);
}
