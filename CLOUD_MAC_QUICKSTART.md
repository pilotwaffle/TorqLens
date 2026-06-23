# TorqLens — Cloud Mac Quickstart

Goal: get a signed TorqLens build into **TestFlight** from a rented macOS
machine, in the shortest (cheapest) session possible. Everything that could be
prepped on Windows already is — the GitHub repo (`pilotwaffle/TorqLens`,
**private**) contains the complete, ready-to-build iOS project.

> The cloud Mac is only needed for the macOS-only steps: Xcode build, signing,
> archive, TestFlight upload. Budget **1–3 hours** of Mac time.

---

## Before you start the Mac clock (do these on Windows / in a browser — free)

These have **no** Mac dependency, so finish them first and the Mac session stays short:

1. **Apple Developer Program** — enrolled ($99/yr) at developer.apple.com.
2. **App Store Connect app record** — create the TorqLens app
   (apps → +) with bundle id `com.torqbusinesssolutions.torqlens`.
3. **Backend deployed over HTTPS** — your `/api/identify`, `/api/info`,
   `/privacy`, `/support` reachable at `https://your-domain`. Verify with the
   health check in `MAC_HANDOFF.md`. (The identification provider package +
   credentials live in the backend host's secret store only.)
4. Have your **Apple ID + app-specific password** (or just sign in to Xcode)
   ready for the upload.

---

## Pick a cloud Mac

Any of these work; all give you a remote macOS desktop with Xcode:

| Service | Notes |
| --- | --- |
| **MacinCloud** (Pay-as-you-go / Managed) | Cheapest for a one-off; ~$1/hr or ~$20/mo. Xcode preinstalled. |
| **MacStadium** | Subscription; better for ongoing use. |
| **AWS EC2 Mac** (`mac2.metal`) | By-the-hour but 24h min allocation; pricier. |
| **Scaleway Apple silicon** | Hourly EU option. |

Choose one with **Xcode already installed** to save setup time. Connect via the
provider's VNC/RDP client.

---

## On the cloud Mac — run these

### 1. Clone the repo
```bash
git clone https://github.com/pilotwaffle/TorqLens.git
cd TorqLens
```
(Use a GitHub Personal Access Token or `gh auth login` — the repo is private.)

### 2. Install Node deps
```bash
npm ci          # uses the committed package-lock.json for an exact install
```
If CocoaPods isn't present:
```bash
sudo gem install cocoapods    # or: brew install cocoapods
```

### 3. Point the iOS bundle at your live backend (HTTPS)
```bash
echo 'NEXT_PUBLIC_API_BASE_URL=https://your-domain' > .env.production
```
> No secrets here. This is just the public backend URL. The build guard rejects
> http/localhost, so it must be your real https domain.

### 4. Build the web shell + sync into iOS
```bash
npm run cap:sync                 # env guard → static export → copy into ios/
bash scripts/configure-ios.sh    # iPhone-only + version 1.0.0 (idempotent)
npm run icons                    # opaque AppIcon set
cd ios/App && pod install && cd ../..   # if not auto-run by cap:sync
```

### 5. Open in Xcode
```bash
npx cap open ios     # opens ios/App/App.xcworkspace (use the WORKSPACE)
```

### 6. Sign
Xcode → **App** target → **Signing & Capabilities**:
- ✅ Automatically manage signing
- Select your **Team**
- Confirm bundle id `com.torqbusinesssolutions.torqlens` (match the App Store
  Connect record from prep step 2).

### 7. Smoke-test on the simulator
- Run (⌘R) on an iPhone simulator.
- Walk the flow: onboarding → upload a photo → analyzing → result → **Remove
  safely opens the safety sheet first** → guidance → History → Saved → Share →
  About/Privacy/Support. (Camera needs a real device; the simulator has no camera.)

### 8. Archive + upload to TestFlight
- Run destination → **Any iOS Device (arm64)**.
- **Product → Archive** → Organizer → **Distribute App → App Store Connect →
  Upload**.
- Wait for processing in App Store Connect → TestFlight.

### 9. (Optional, on the Mac or later on your iPhone) capture screenshots
Install the TestFlight build on a **real iPhone**, then capture final App Store
screenshots (1290×2796) of: Home, capture moment, analyzing, result,
grow-or-remove, history. These replace the design-reference images.

---

## After the Mac session (back on Windows / iPhone — free)
- Install via **TestFlight on your iPhone**; verify camera + photo picker + the
  full flow against the live backend.
- In **App Store Connect** (browser or the iPhone app): attach screenshots, fill
  metadata (name TorqLens, subtitle "AI Plant & Weed Scanner", Utilities/4+,
  Privacy + Support URLs, App Privacy = Photos for app functionality only / not
  tracked / not sold), then **Submit for Review**.

See `RELEASE_CHECKLIST.md` for the full go/no-go list.

---

## Time/cost estimate
- Prep (Windows/browser): ~30–60 min, $0 beyond the $99/yr Apple account.
- Cloud Mac session: ~1–3 hrs → ~$2–6 on pay-as-you-go.

© 2026 Torq Business Solutions.
