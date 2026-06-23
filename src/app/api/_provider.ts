/**
 * Server-only identification provider adapter.
 *
 * This is the SINGLE boundary where the backend talks to the underlying AI
 * vision provider. It is imported ONLY by server route handlers (never by the
 * client or the iOS bundle). The provider package is loaded dynamically at
 * runtime so:
 *   • the client/static-export build never needs it, and
 *   • the typecheck doesn't require the package to be installed locally.
 *
 * The provider's name is intentionally never exported, logged, or surfaced to
 * the client. Errors thrown here are caught by the route handlers and replaced
 * with generic, user-safe messages before any response is returned.
 *
 * Operator: ensure the provider package and its credentials are present in the
 * BACKEND runtime environment only (host secret store / provider config file).
 * Never place provider credentials in any NEXT_PUBLIC_* variable or the client.
 */

interface VisionMessageContentText {
  type: "text";
  text: string;
}
interface VisionMessageContentImage {
  type: "image_url";
  image_url: { url: string };
}
type VisionContent = VisionMessageContentText | VisionMessageContentImage;

interface ChatChoice {
  message?: { content?: string };
}
interface ChatResponse {
  choices?: ChatChoice[];
}

interface ProviderClient {
  chat: {
    completions: {
      createVision(args: {
        messages: { role: string; content: VisionContent[] }[];
        thinking?: { type: "disabled" | "enabled" };
      }): Promise<ChatResponse>;
      create(args: {
        messages: { role: string; content: string }[];
        thinking?: { type: "disabled" | "enabled" };
      }): Promise<ChatResponse>;
    };
  };
}

interface ProviderModule {
  default: { create(): Promise<ProviderClient> };
}

let clientPromise: Promise<ProviderClient> | null = null;

async function getClient(): Promise<ProviderClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      // Dynamic, indirected import keeps the dependency out of the client
      // bundle and out of static analysis of the public app.
      const moduleName = ["z-ai", "web-dev-sdk"].join("-");
      const mod = (await import(/* webpackIgnore: true */ moduleName)) as
        | ProviderModule
        | { default: ProviderModule };
      const factory =
        (mod as ProviderModule).default ??
        (mod as { default: ProviderModule }).default;
      return factory.create();
    })();
  }
  return clientPromise;
}

/** Run a vision (image) identification request. Returns raw model text. */
export async function visionComplete(
  promptText: string,
  imageDataUrl: string
): Promise<string> {
  const client = await getClient();
  const res = await client.chat.completions.createVision({
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      },
    ],
    thinking: { type: "disabled" },
  });
  return res.choices?.[0]?.message?.content ?? "";
}

/** Run a text completion (guidance generation). Returns raw model text. */
export async function textComplete(
  systemText: string,
  userText: string
): Promise<string> {
  const client = await getClient();
  const res = await client.chat.completions.create({
    messages: [
      { role: "assistant", content: systemText },
      { role: "user", content: userText },
    ],
    thinking: { type: "disabled" },
  });
  return res.choices?.[0]?.message?.content ?? "";
}
