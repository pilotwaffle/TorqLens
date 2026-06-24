import { NextResponse, type NextRequest } from "next/server";

/**
 * CORS for the API routes.
 *
 * The iOS (Capacitor) app runs from a different origin than the backend
 * (capacitor://localhost / https://localhost / ionic://localhost), so the
 * webview enforces CORS on requests to https://torqlens.vercel.app. Without
 * Access-Control-Allow-Origin on the response, the fetch is blocked at the
 * network layer and the app shows "couldn't analyze / check your connection".
 *
 * The identify/info endpoints are public, unauthenticated, and contain no
 * secrets (the provider key lives only in the server runtime), so reflecting
 * the request origin is safe here. We answer the preflight OPTIONS directly.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

function allowOrigin(req: NextRequest): string {
  // Reflect the caller's origin (Capacitor sends capacitor://localhost etc.);
  // fall back to "*" when no Origin header is present.
  return req.headers.get("origin") ?? "*";
}

export function proxy(req: NextRequest) {
  const origin = allowOrigin(req);

  // Preflight: answer immediately with the CORS headers.
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: { ...CORS_HEADERS, "Access-Control-Allow-Origin": origin },
    });
  }

  // Actual request: let it through, then attach CORS headers to the response.
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", origin);
  for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
  return res;
}

export const config = {
  // Only the API routes need CORS.
  matcher: ["/api/:path*"],
};
