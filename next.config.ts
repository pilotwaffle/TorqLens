import type { NextConfig } from "next";

/**
 * TorqLens build configuration.
 *
 * Two build modes share one codebase:
 *
 *  1. WEB (default) — full Next.js app deployed to the backend host
 *     (Vercel). Serves the SPA shell *and* the server API routes
 *     (`/api/identify`, `/api/info`) plus the public `/privacy` and
 *     `/support` pages. This is the backend the iOS app talks to.
 *
 *  2. CAPACITOR (`CAP_BUILD=1`) — a static export of just the app shell,
 *     bundled inside the iOS app. The native client calls the remote
 *     backend (NEXT_PUBLIC_API_BASE_URL); no server code or secrets ship
 *     in the client bundle. `output: "export"` forbids API routes, so the
 *     route handlers are simply not part of this output.
 */
const isCapacitor = process.env.CAP_BUILD === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Static export for the Capacitor bundle; standard server build for web.
  ...(isCapacitor
    ? {
        output: "export",
        // Capacitor serves files from a local webview; relative assets only.
        images: { unoptimized: true },
        // Native shell screens live under /app; API + web-only pages are
        // excluded from the static export (they 404 in the bundle by design,
        // because the client only ever calls the *remote* backend).
      }
    : {}),
};

export default nextConfig;
