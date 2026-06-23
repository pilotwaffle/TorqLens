# TorqLens v1 — Release Checklist

Status legend: **[x]** verified on Windows · **[ ] (operator)** must be done/confirmed
on the Mac or in your hosting/App Store Connect environment.

---

## Security & privacy
- [x] **No `.env` tracked** — only `.env.example` is committed (`git ls-files | grep .env`).
- [x] **No secrets tracked** — no `.env`, `.z-ai-config`, `*.key`, or credential files in git.
- [x] **No provider names in client/UI** — the AI provider string appears only in
      the server-only adapter `src/app/api/_provider.ts` (never bundled). Zero hits
      in `src/components`, `src/lib`, pages, `public/`, or the `out/` export.
- [x] **API errors are sanitized** — `/api/identify` & `/api/info` return only generic
      messages (no stack traces, no raw model output, no `err.message` passthrough).
- [ ] (operator) **No provider/API key exposed in the deployed client** — grep the
      live built JS (see `MAC_HANDOFF.md` → Backend health check #5).

## Build artifacts
- [x] **`.dc.html` not shipped as production app** — no `.dc.html` anywhere in the repo.
- [x] **App icon opaque** — `public/brand/app-icon-1024-appstore.png` and all
      `AppIcon.appiconset` PNGs are RGB / alpha=False / square / no baked corners.
- [x] **iPhone-only config confirmed** — `TARGETED_DEVICE_FAMILY = 1` (both configs),
      portrait-only, no iPad orientation block.

## iOS config
- [x] **Camera permission string present** — `NSCameraUsageDescription` in `Info.plist`.
- [x] **Photo library permission string present** — `NSPhotoLibraryUsageDescription` in `Info.plist`.
- [x] **Version / build set** — `MARKETING_VERSION = 1.0.0`, `CURRENT_PROJECT_VERSION = 1`.
- [x] **Bundle ID** — `com.torqbusinesssolutions.torqlens` (matches `capacitor.config.ts`).
- [ ] (operator) **Signing Team set** in Xcode.

## Functionality (verified in browser at iPhone viewport; re-confirm on device)
- [x] **History works** — scans persist on-device and reopen.
- [x] **Favorites work** — heart toggles; Saved tab lists favorites.
- [x] **Share sheet works** — native Share on iOS / Web Share fallback on web.
- [x] **Safety sheet gates removal guidance** — "Remove safely" always opens the
      safety sheet first; "Grow it" is not gated.
- [x] **No "Kill it" / Skull in UI** — language is "Remove safely" throughout.
- [x] **No dead Terms link** — the About hub exposes Privacy / Support / Safety only;
      no Terms link is rendered, so no `/terms` route is required for v1.
- [ ] (operator) **Camera + photo picker on a real iPhone** — confirm native prompts.

## Backend
- [ ] (operator) **Backend identify endpoint live over HTTPS** — see `MAC_HANDOFF.md` #1–3.
- [ ] (operator) **`NEXT_PUBLIC_API_BASE_URL` points to the live backend** (https).
- [ ] (operator) **Identify returns a real result** with a test image.

## Public web pages
- [x] **`/privacy` page builds & renders** — no bracket placeholders, no provider name.
- [x] **`/support` page builds & renders** — no bracket placeholders.
- [ ] (operator) **Privacy URL live** — `https://your-domain/privacy` reachable.
- [ ] (operator) **Support URL live** — `https://your-domain/support` reachable.

## App Store submission
- [ ] (operator) **Screenshots re-exported from the actual iOS build** (1290×2796 or
      another Apple-accepted size). The handoff PNGs are references only.
- [ ] (operator) **App Store metadata matches working features** — name "TorqLens",
      subtitle "AI Plant & Weed Scanner", Utilities/Lifestyle, 4+, Privacy + Support
      URLs, App Privacy answers (Photos for app functionality only; not tracked; not sold).

© 2026 Torq Business Solutions.
