# TorqLens — MacinCloud → TestFlight (beginner walkthrough)

You don't own a Mac, so you'll **rent one online** and control it from your
Windows PC (like Remote Desktop). The Mac is only needed because **Xcode** — the
one tool that can build, sign, and upload an iOS app — runs only on macOS.

Everything else is already done: the app, the live backend
(`https://torqlens.vercel.app`), the GitHub repo, the Apple account, the bundle
ID, and the App Store Connect record. This is the **last step**.

**Time:** ~1–3 hours of Mac time. **Cost:** a few dollars pay-as-you-go.

---

## Part 1 — Rent the Mac (in your Windows browser)

1. Go to **https://www.macincloud.com** → **Plans**.
2. Choose **Pay-As-You-Go** (cheapest for one build) or **Managed Server**
   (~$30/mo, simplest). Pick a plan that says **Xcode is pre-installed**.
3. Create an account, pay, and you'll get a **Mac server** with:
   - a host/IP address, a username, and a password, OR
   - a **web browser access** button (some plans let you use the Mac right in
     your browser — easiest, no extra software).
4. **Connect to the Mac:**
   - **Browser access** (if offered): click "Connect" / "Open" — the Mac
     desktop appears in your browser tab. Done.
   - **RDP** (Remote Desktop): Windows has a built-in app called
     **"Remote Desktop Connection"** (search for it in the Start menu). Enter
     the host/IP MacinCloud gave you, then the username/password. The Mac
     desktop appears in a window.

You're now looking at a macOS desktop. The dock at the bottom has **Finder**,
**Safari**, and a black **Terminal** icon (or find Terminal via Spotlight:
press **Cmd+Space**, type "Terminal", Enter).

---

## Part 2 — One-time Mac setup (run once)

Open **Terminal** on the Mac and check these exist (most MacinCloud Xcode
plans already have them):

```bash
xcodebuild -version     # should print Xcode 15+ ; if "command not found", open the App Store on the Mac and install Xcode
node --version          # need 20+ ; if missing: install from https://nodejs.org (LTS .pkg) or `brew install node`
pod --version           # CocoaPods ; if missing: `sudo gem install cocoapods`
git --version           # almost always present
```

If Xcode is missing: open **App Store** on the Mac → search **Xcode** → Install
(it's large, ~10–15 min). Then run `sudo xcodebuild -license accept` and
`xcodebuild -runFirstLaunch`.

---

## Part 3 — Build the app (copy-paste this whole block into the Mac Terminal)

This clones your repo, points the app at the live backend, builds the web
shell, and syncs it into the iOS project. Replace **YOUR_GITHUB_USERNAME** is
not needed — the repo path is fixed; you'll just authenticate when prompted.

```bash
# 1) Clone your repo (it's private — when prompted for a password, paste a
#    GitHub Personal Access Token, NOT your GitHub password.
#    Make one at github.com → Settings → Developer settings → Personal access
#    tokens → Tokens (classic) → Generate, with "repo" scope.)
cd ~/Desktop
git clone https://github.com/pilotwaffle/TorqLens.git
cd TorqLens

# 2) Install dependencies (exact versions from the lockfile)
npm ci

# 3) Point the iOS bundle at the LIVE backend (https — required)
echo 'NEXT_PUBLIC_API_BASE_URL=https://torqlens.vercel.app' > .env.production

# 4) Build the web shell + copy it into the iOS project
npm run cap:sync

# 5) Re-assert iPhone-only + version, generate the opaque app icons
bash scripts/configure-ios.sh
npm run icons

# 6) Install iOS native pods (if cap:sync didn't already)
cd ios/App && pod install && cd ../..

# 7) Open the project in Xcode
npx cap open ios
```

Step 7 opens **Xcode** with `App.xcworkspace`. (If it opens the wrong file,
in Xcode do File → Open and pick `ios/App/App.xcworkspace` — the **workspace**,
not the project.)

---

## Part 4 — Sign + run in Xcode (clicking, not typing)

1. In Xcode's left panel, click the blue **App** project at the top.
2. Select the **App** target → **Signing & Capabilities** tab.
3. Check **Automatically manage signing**.
4. **Team:** pick your Apple Developer team from the dropdown (sign in with your
   Apple ID if asked — same one as App Store Connect).
5. Confirm **Bundle Identifier** reads `com.torqbusinesssolutions.torqlens`
   (it already does — it's set in the project and matches your registered App ID).
6. **Smoke test (optional but smart):** at the top, pick an **iPhone simulator**
   (e.g. iPhone 15) and press the ▶ **Run** button. The app launches in a
   simulated iPhone. Tap through: onboarding → upload a photo → it should call
   the live backend and return a real identification. (Camera needs a real
   device; the simulator has no camera — use "upload" to test.)

---

## Part 5 — Archive + upload to TestFlight

1. At the top of Xcode, change the run target from the simulator to
   **Any iOS Device (arm64)**.
2. Menu bar: **Product → Archive**. Wait for it to build (a few minutes).
3. The **Organizer** window opens with your archive. Click
   **Distribute App → App Store Connect → Upload** → keep clicking Next/Upload
   through the defaults → **Upload**.
4. Wait for "Upload Successful." Apple then **processes** the build
   (~5–15 min) — you'll see it appear under **TestFlight** in App Store Connect.

---

## Part 6 — After the build is up (back on Windows or your iPhone)

1. **Install on your iPhone:** open the **TestFlight** app (App Store) on your
   iPhone, sign in with your Apple ID, and install TorqLens. Test the real app
   with the camera.
2. **Screenshots:** in TestFlight on your iPhone, take screenshots (press the
   side button + volume up) of: Home, capture moment, a result, grow/remove
   guidance, history. These are your **real** App Store screenshots.
3. **Upload screenshots** in App Store Connect → your version → Previews and
   Screenshots (iPhone 6.5"/6.9").
4. On the version page, scroll to **Build**, click **+**, select the build you
   uploaded.
5. Make sure App Privacy + Pricing are filled (see `APP_STORE_LISTING.md`).
6. Click **Add for Review** → **Submit for Review**.

That's it — TorqLens is submitted. Apple review typically takes 1–3 days.

---

## If you get stuck
- **"git clone" asks for a password** → use a GitHub Personal Access Token, not
  your account password (see step 1 note).
- **`npm run cap:sync` fails with "NEXT_PUBLIC_API_BASE_URL..."** → step 3 didn't
  run; re-run `echo 'NEXT_PUBLIC_API_BASE_URL=https://torqlens.vercel.app' > .env.production`.
- **`pod: command not found`** → `sudo gem install cocoapods`, then re-run step 6.
- **Xcode signing error** → make sure your Apple ID is added in Xcode →
  Settings → Accounts, and a Team is selected in Signing & Capabilities.
- **Build button greyed out** → make sure you opened `App.xcworkspace`
  (workspace), not `App.xcodeproj`.

You can stop the MacinCloud rental once the build is uploaded to TestFlight —
everything after that (screenshots, submit) works from Windows/iPhone.

© 2026 Torq Business Solutions.
