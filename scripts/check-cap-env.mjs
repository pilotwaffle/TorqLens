/**
 * Build-time guard for Capacitor (iOS) builds.
 *
 * The iOS bundle bakes NEXT_PUBLIC_API_BASE_URL at build time. If it is missing
 * or points at localhost / plaintext http, the shipped app cannot reach the
 * backend (and iOS App Transport Security blocks http). This guard fails the
 * `cap:build` early with a clear message so a bad URL never reaches a device.
 *
 * Note: Next.js also loads `.env.local` during a production build. For the
 * Capacitor build, set the production URL explicitly (e.g. a `.env.production`
 * with NEXT_PUBLIC_API_BASE_URL=https://…, or export it in your shell/CI) — it
 * takes precedence over `.env.local` for production builds.
 */
const url = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function fail(msg) {
  console.error(`\n✗ Capacitor build blocked: ${msg}\n`);
  console.error(
    "  Set a production backend URL before building the iOS bundle, e.g.:\n" +
      "    NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com npm run cap:sync\n" +
      "  or put it in .env.production (NEXT_PUBLIC_API_BASE_URL=https://…).\n"
  );
  process.exit(1);
}

if (!url) {
  fail("NEXT_PUBLIC_API_BASE_URL is not set.");
}
if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|\/|$)/i.test(url)) {
  fail(`NEXT_PUBLIC_API_BASE_URL points at localhost ("${url}").`);
}
if (!/^https:\/\//i.test(url)) {
  fail(
    `NEXT_PUBLIC_API_BASE_URL must use https for iOS (App Transport Security). Got "${url}".`
  );
}

console.log(`✓ Capacitor build target: ${url}`);
