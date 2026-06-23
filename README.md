# TorqLens — AI Plant & Weed Scanner

**TorqLens** is a premium homeowner AI utility: scan a plant, weed, grass, or
flower and get an AI identification with practical *grow-or-remove-safely*
guidance. A product of **Torq Business Solutions**.

This repo holds **one codebase** that produces two artifacts:

1. **Web / backend** — a Next.js app (App Router) deployed to your host. It
   serves the public `/privacy` and `/support` pages **and** the server API
   routes (`/api/identify`, `/api/info`) that perform identification.
2. **iOS app** — an iPhone-only Capacitor app. It bundles a static export of
   the app shell and calls the **remote backend only**. No API keys, secrets,
   or AI-provider names live in the client/iOS bundle.

---

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4
- Capacitor 6 (iOS) — Camera, Preferences, Share, Haptics, Splash, Status Bar
- Fonts: Hanken Grotesk (UI) · JetBrains Mono (confidence %, scientific names)

---

## Project layout

```
src/
  app/
    layout.tsx            Root layout, fonts, provider-free metadata
    page.tsx              The app shell — screen router + scan-flow state machine
    globals.css           TorqLens design tokens (navy/leaf/signal/caution/mist)
    privacy/page.tsx      Public /privacy web page (App Store privacy URL)
    support/page.tsx      Public /support web page (App Store support URL)
    api/
      _provider.ts        SERVER-ONLY identification provider adapter (never bundled)
      identify/route.ts   POST /api/identify  → { identified, isPlant, primary, candidates }
      info/route.ts       POST /api/info      → grow / remove-safely guidance (markdown)
  components/
    screens/              Onboarding, Home, Analyzing, Result, Guidance, SafetySheet,
                          HistoryList, About (+ Privacy/Support/Safety sub-screens), chrome
    ui/                   Button, primitives (Card/Badge/MatchBar), sheet, markdown
  lib/
    types.ts              Shared domain types (provider-agnostic)
    api.ts                Backend client (NEXT_PUBLIC_API_BASE_URL) + ApiError
    image.ts              Client-side compression (max 1600px, JPEG ~0.82, <1.5MB)
    native.ts             Capacitor bridges (camera/share/haptics) with web fallbacks
    storage.ts            On-device history & favorites (Preferences/localStorage)
    content.ts            Canonical in-app copy (no provider names, no placeholders)
scripts/
  generate-icons.mjs      Produces the OPAQUE App Store icon + iOS AppIcon set
  configure-ios.sh        Idempotent iOS settings (iPhone-only, version) — run on Mac
public/brand/             Logo marks + app-icon-1024-appstore.png (opaque master)
design-reference/         Design reference screenshots (docs only — NOT shipped)
ios/                      Capacitor iOS Xcode project
capacitor.config.ts       appId com.torqbusinesssolutions.torqlens, webDir "out"
```

---

## Environment variables

Copy `.env.example` → `.env.local` and fill values. **Never commit `.env*`** (it
is gitignored; `.env.example` is the only committed env file and holds no real
values).

| Variable | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | client (build-time) | Base URL the app calls. Empty = same-origin (web). For iOS, set to the deployed backend URL (e.g. `TORQLENS_API_URL` = `https://api.yourdomain.com`). |
| *(provider credentials)* | **backend runtime only** | The identification provider credentials, read server-side by `src/app/api/_provider.ts`. Configure in your host's secret store (e.g. `IDENTIFY_API_ENDPOINT` / `IDENTIFY_API_KEY` or the provider's own config). **Never** put these in any `NEXT_PUBLIC_*` var or the client. |

> The backend uses a provider package that is intentionally **not** a hard
> dependency in `package.json` and is loaded dynamically at runtime by the
> server adapter. Ensure that package + its credentials exist in the **backend**
> deployment environment only.

---

## Commands

```bash
npm install              # install deps

# ── Web / backend ──────────────────────────────────────────────
npm run dev              # dev server at http://localhost:3000
npm run build            # production web build (App + API + /privacy + /support)
npm run start            # serve the production build
npm run lint             # eslint
npm run typecheck        # tsc --noEmit

# ── iOS (Capacitor) ────────────────────────────────────────────
npm run icons            # generate opaque App Store icon + iOS AppIcon set
npm run cap:build        # CAP_BUILD=1 next build → static export to out/
npm run cap:sync         # cap:build + copy assets into ios/
npm run cap:open         # open the Xcode project (macOS only)
npm run ios              # cap:sync + cap:open
```

---

## iOS build & submission (macOS required)

The native build, simulator run, archive, and upload all require **macOS +
Xcode + CocoaPods**. From a Mac with this repo checked out:

```bash
npm install
# Point the client at your deployed backend for the iOS bundle:
echo 'NEXT_PUBLIC_API_BASE_URL=https://YOUR-BACKEND-DOMAIN' > .env.local

npm run cap:sync               # build static export + copy into ios/
bash scripts/configure-ios.sh  # re-assert iPhone-only + version (idempotent)
npm run icons                  # (re)generate the opaque AppIcon set
npx cap open ios               # opens ios/App/App.xcworkspace in Xcode
```

In Xcode:
1. Select the **App** target → **Signing & Capabilities** → set your **Team**
   and a unique bundle id if needed (default `com.torqbusinesssolutions.torqlens`).
2. **General → Deployment Info**: confirm **iPhone** only (no iPad), portrait.
3. Run on an **iPhone simulator** (or a device) to verify camera, photo picker,
   scan flow, history, favorites, share sheet, and the safety gate.
4. **Product → Archive** → **Distribute App** → upload to **App Store Connect**
   (TestFlight).

### App Store Connect metadata
Use the listing copy from the design handoff (`copy/app-store-listing.md`):
- **Name:** TorqLens · **Subtitle:** AI Plant & Weed Scanner
- **Category:** Utilities (secondary: Lifestyle) · **Age:** 4+
- **Privacy Policy URL:** `https://YOUR-DOMAIN/privacy`
- **Support URL:** `https://YOUR-DOMAIN/support`
- **App icon:** upload `public/brand/app-icon-1024-appstore.png` (opaque, 1024×1024).
- **Screenshots:** **Re-export from the real running iOS build** before
  submission. The PNGs in the design handoff are launch-direction references,
  not final pixels.

---

## Safety & compliance (built in)

- **"Remove safely"** everywhere — never "Kill it."
- A native **safety sheet** is shown **before any** removal/herbicide guidance.
- Confidence score + alternatives are always surfaced; users are prompted to
  verify before acting.
- The app calls the **backend only**. No API keys / secrets / provider names in
  the client, the repo, or public metadata. API error responses are sanitized
  (no raw model output, no stack traces).
- v1 has **no account, login, subscriptions, ads, location, or push**. Scan
  history & favorites are stored **on-device** only.

---

## Notes for operators

- Real homeowner yard photos should replace any reference imagery before the
  final store listing. The app itself uses the user's own camera/library photos.
- If a provider credential was ever committed or exposed historically, rotate it
  before launch. This repo was initialized clean (no `.env`/secrets committed).
- The web `/privacy` and `/support` pages are live, publishable, and free of
  bracket placeholders. Update the support email / "last updated" date if your
  details differ from `src/lib/content.ts`.

## Going to the Mac / App Store

- **`MAC_HANDOFF.md`** — exact step-by-step from `npm install` → TestFlight →
  App Store Connect, plus a **backend health check** (confirm HTTPS, the
  identify endpoint returns a real result, errors are sanitized, and no key is
  exposed in the client) to run before any TestFlight build.
- **`RELEASE_CHECKLIST.md`** — the final go/no-go checklist (security, icon,
  iPhone-only, permissions, functionality, live URLs, screenshots, metadata).

© 2026 Torq Business Solutions.
