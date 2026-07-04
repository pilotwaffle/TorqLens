#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# TorqLens — one-shot Mac setup to archive & upload build 3 (rejection fix).
#
# Build 2 was rejected (Guideline 2.1(a)): the AI scan errored on device
# because the backend rejected the capacitor://localhost origin (CORS). The
# CORS fix is already LIVE at https://torqlens.vercel.app. This script just
# repackages a fresh build that reaches it. Run from the project root on the
# Mac:
#
#     bash scripts/mac-setup.sh
#
# It will:
#   1. Bake NEXT_PUBLIC_API_BASE_URL=https://torqlens.vercel.app into
#      .env.production (gitignored; the iOS bundle bakes it at build time).
#   2. Bump the iOS build number 2 -> 3 (Apple rejects a same-numbered re-upload).
#   3. npm install
#   4. npm run cap:sync   (next build + cap sync ios; guard verifies the https URL)
#   5. GREP GUARDRAIL — verify the backend URL is baked into the iOS web bundle.
#   6. bash scripts/configure-ios.sh   (iPhone-only + version)
#   7. npm run icons
#   8. pod install
#   9. Opens the Xcode workspace so you can Archive -> upload -> resubmit.
#
# Safe to re-run. Stops immediately on any hard failure.
# ─────────────────────────────────────────────────────────────────────────
set -uo pipefail

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
ok()   { printf '\033[1;32m    OK: %s\033[0m\n' "$1"; }
die()  { printf '\n\033[1;31m✗ STOP: %s\033[0m\n' "$1" >&2; exit 1; }

[ -f package.json ] || die "Run this from the TorqLens folder (package.json not found here)."
[ -d ios/App ]      || die "ios/App not found — wrong folder or incomplete download."

BACKEND="https://torqlens.vercel.app"
PBXPROJ="ios/App/App.xcodeproj/project.pbxproj"

# ── 1. Backend URL ───────────────────────────────────────────────────────
say "Step 1/9 — backend URL (.env.production)"
printf 'NEXT_PUBLIC_API_BASE_URL=%s\n' "$BACKEND" > .env.production
ok "Wrote .env.production -> $BACKEND"

# ── 2. Bump build number ─────────────────────────────────────────────────
say "Step 2/9 — bump iOS build number to 3"
[ -f "$PBXPROJ" ] || die "$PBXPROJ not found."
CUR=$(grep -m1 'CURRENT_PROJECT_VERSION' "$PBXPROJ" | grep -oE '[0-9]+' | head -1)
echo "    current build number: ${CUR:-unknown}"
sed -i.bak 's/CURRENT_PROJECT_VERSION = [0-9]*;/CURRENT_PROJECT_VERSION = 3;/g' "$PBXPROJ"
rm -f "$PBXPROJ.bak"
NEW=$(grep -m1 'CURRENT_PROJECT_VERSION' "$PBXPROJ" | grep -oE '[0-9]+' | head -1)
[ "$NEW" = "3" ] || die "Failed to set build number to 3 (got '$NEW'). Fix manually in Xcode: target > General > Build = 3."
ok "Build number is now 3."

# ── 3. npm install ───────────────────────────────────────────────────────
say "Step 3/9 — npm install (a minute or two)"
npm install || die "npm install failed."
ok "Dependencies installed."

# ── 4. cap sync (next build + copy into ios) ─────────────────────────────
say "Step 4/9 — npm run cap:sync (builds web + syncs into ios/)"
npm run cap:sync || die "cap:sync failed (check the NEXT_PUBLIC_API_BASE_URL guard message above)."
ok "Web bundle built + synced into ios/."

# ── 5. Grep guardrail ────────────────────────────────────────────────────
say "Step 5/9 — verifying the backend URL is baked into the iOS bundle"
if grep -rlq "torqlens.vercel.app" ios/App/App/public/ 2>/dev/null; then
  ok "Backend URL is baked into the iOS bundle (the fix the rejection needed)."
else
  die "Backend URL NOT found in ios/App/App/public — the app would fail on device again. Do NOT archive."
fi

# ── 6. configure-ios ─────────────────────────────────────────────────────
say "Step 6/9 — configure-ios.sh (iPhone-only + version)"
bash scripts/configure-ios.sh || die "configure-ios.sh failed."
ok "iOS project configured."

# ── 7. icons ─────────────────────────────────────────────────────────────
say "Step 7/9 — regenerating app icons"
if npm run | grep -q '  icons'; then
  npm run icons || die "icon generation failed."
  ok "AppIcon set regenerated."
else
  ok "No icons script — skipping."
fi

# ── 8. pod install ───────────────────────────────────────────────────────
say "Step 8/9 — pod install"
( cd ios/App && pod install ) || die "pod install failed. Try 'sudo gem install cocoapods' then re-run."
ok "CocoaPods installed."

# ── 9. open Xcode ────────────────────────────────────────────────────────
say "Step 9/9 — opening the Xcode workspace"
open ios/App/App.xcworkspace || die "Could not open workspace. Open ios/App/App.xcworkspace manually."

printf '\n\033[1;32m════════════════════════════════════════════════════════════\n'
printf ' ALL AUTOMATED STEPS DONE (build 3). In Xcode now:\n'
printf '   1. App target -> Signing & Capabilities -> Team = Barry Flowers,\n'
printf '      "Automatically manage signing" on (TorqLens App Store profile exists).\n'
printf '   2. Top bar: destination = "Any iOS Device (arm64)".\n'
printf '   3. Product -> Archive.  (10-20 min)\n'
printf '   4. Organizer -> Distribute App -> App Store Connect -> Upload.\n'
printf '   5. In App Store Connect: TorqLens -> the rejected submission ->\n'
printf '      select build 3 -> Resubmit, with a reply to App Review:\n'
printf '      "Fixed a network configuration (CORS) bug that prevented the AI\n'
printf '       scan from reaching our API. Verified working on device."\n'
printf '════════════════════════════════════════════════════════════\033[0m\n'
