# TorqLens — Mac / Xcode Handoff

The Windows-side implementation is complete and verified. These are the exact
steps to take TorqLens v1 from this repo to TestFlight and the App Store. They
require **macOS + Xcode + CocoaPods** (none of which run on Windows).

> Do **not** paste secrets into this file, the repo, or chat. Set the backend
> URL via env / `.env.production`; configure provider credentials only in the
> backend host's secret store.

---

## Prerequisites (Mac)
- Xcode (latest stable) + Command Line Tools
- CocoaPods (`sudo gem install cocoapods` or `brew install cocoapods`)
- Node 20+ and npm
- An Apple Developer account (for signing + TestFlight)

---

## Steps

### 1. Install dependencies
```bash
cd TorqLens
npm install
```

### 2. Set `NEXT_PUBLIC_API_BASE_URL` (production backend, HTTPS)
The iOS bundle bakes this at build time. Use your deployed backend's **https**
URL (localhost / http is rejected by the build guard and by iOS ATS).
```bash
echo 'NEXT_PUBLIC_API_BASE_URL=https://your-backend.example.com' > .env.production
```
> Provider credentials are **not** set here — they live only in the backend
> host's secret store and are read server-side. Never put them in any
> `NEXT_PUBLIC_*` variable.

### 3. Run the web build (sanity check)
```bash
npm run build
```
Expect a clean build with routes `/`, `/privacy`, `/support`, `/api/identify`,
`/api/info`.

### 4. Run Capacitor sync
```bash
npm run cap:sync
```
This runs the env guard, exports the static web shell to `out/`, and copies it
into `ios/`. Then re-assert iOS settings and icons:
```bash
bash scripts/configure-ios.sh   # iPhone-only + version (idempotent)
npm run icons                   # opaque AppIcon set
```
If CocoaPods didn't run automatically:
```bash
cd ios/App && pod install && cd ../..
```

### 5. Open the iOS project in Xcode
```bash
npx cap open ios
```
This opens `ios/App/App.xcworkspace` (use the **workspace**, not the project).

### 6. Set the Apple signing Team
In Xcode → **App** target → **Signing & Capabilities**:
- Check **Automatically manage signing**
- Select your **Team**

### 7. Confirm the Bundle ID
- Default: `com.torqbusinesssolutions.torqlens`
- Change it here if your App Store Connect record uses a different ID, and make
  the **same** change in `capacitor.config.ts` (`appId`).

### 8. Run on the iPhone simulator
- Pick any iPhone simulator (e.g. iPhone 15) → **Run** (⌘R).
- Verify: onboarding → take/upload photo → analyzing → result (confidence +
  alternatives) → **Grow it** and **Remove safely** (safety sheet appears
  first) → History → Saved/Favorites → Share → About/Privacy/Support/Safety.

### 9. Run on a physical iPhone (if available)
- Connect device, select it as the run target, **Run**.
- Confirm the **camera** and **photo library** permission prompts appear and
  identification works against your live backend.

### 10. Archive
- Set the run destination to **Any iOS Device (arm64)**.
- **Product → Archive**.

### 11. Upload to TestFlight
- In the Organizer: **Distribute App → App Store Connect → Upload**.
- After processing, add testers in App Store Connect → TestFlight.

### 12. Re-export App Store screenshots from the real app
- The PNGs in the design handoff are launch-direction references, **not** final
  pixels. Capture fresh screenshots from the running iOS build:
  Onboarding/Home, capture moment, analyzing, result, grow-or-remove, history.
- Required device size (6.9"): **1290×2796** (or another Apple-accepted size).

### 13. Submit to App Store Connect
- Fill listing metadata (see `RELEASE_CHECKLIST.md` and the handoff
  `copy/app-store-listing.md`).
- Set **Privacy Policy URL** = `https://your-domain/privacy` and
  **Support URL** = `https://your-domain/support` (must be live).
- Answer App Privacy: Photos collected for app functionality only; not used for
  tracking; not sold; no third-party advertising.
- Submit for review.

---

## Version & build number (item 6)
Already set in `ios/App/App.xcodeproj/project.pbxproj`:
- **Marketing version (`MARKETING_VERSION`):** `1.0.0`
- **Build number (`CURRENT_PROJECT_VERSION`):** `1`

To change later: Xcode → **App** target → **General → Identity** (Version /
Build), or edit `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in the pbxproj.
For each new TestFlight upload, **increment the build number**.

---

## Backend health check (before TestFlight)
Verify the backend before shipping a build that depends on it:

1. **Deployed over HTTPS** — open `https://your-backend.example.com` and confirm
   it serves (valid TLS, not http).
2. **`NEXT_PUBLIC_API_BASE_URL` points to it** — confirm `.env.production`
   matches the deployed domain; the `cap:build` guard fails on missing/http/localhost.
3. **Identify endpoint returns a real result** with a test image:
   ```bash
   # Build a tiny data URL from a real test JPEG and POST it:
   IMG="data:image/jpeg;base64,$(base64 -i test-plant.jpg | tr -d '\n')"
   curl -s -X POST https://your-backend.example.com/api/identify \
     -H 'Content-Type: application/json' \
     -d "{\"image\":\"$IMG\"}" | head -c 600
   ```
   Expect JSON like `{"identified":true,"isPlant":true,"primary":{...},"candidates":[...]}`.
4. **API errors are sanitized** — send a bad request and confirm only a generic
   message comes back (no stack trace, no provider name, no raw model output):
   ```bash
   curl -s -X POST https://your-backend.example.com/api/identify \
     -H 'Content-Type: application/json' -d '{}'
   # → {"error":"Missing image. Please attach a photo and try again."}
   ```
5. **No provider/API key exposed in the client** — fetch the built JS and grep:
   ```bash
   curl -s https://your-backend.example.com/ | grep -ioE 'sk-[a-z0-9]+|api[_-]?key' || echo "clean"
   ```
   Expect no matches. (The provider package + credentials live server-side only.)

© 2026 Torq Business Solutions.
