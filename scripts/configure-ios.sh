#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# TorqLens — idempotent iOS project configuration.
#
# Re-applies the App-Store settings that `npx cap add ios` does NOT set by
# default. Safe to run repeatedly (e.g. after re-adding the platform on a Mac).
#
# Run from the project root on macOS:
#     npm run cap:sync        # builds web + copies into ios/
#     bash scripts/configure-ios.sh
#     npm run icons           # regenerate opaque AppIcon set
#     npx cap open ios        # open in Xcode
# ─────────────────────────────────────────────────────────────────────────
set -euo pipefail

PBXPROJ="ios/App/App.xcodeproj/project.pbxproj"
INFO="ios/App/App/Info.plist"

if [ ! -f "$PBXPROJ" ]; then
  echo "✗ $PBXPROJ not found — run 'npx cap add ios' first." >&2
  exit 1
fi

# 1) iPhone-only (device family 1, not "1,2")
if grep -q 'TARGETED_DEVICE_FAMILY = "1,2";' "$PBXPROJ"; then
  sed -i.bak 's/TARGETED_DEVICE_FAMILY = "1,2";/TARGETED_DEVICE_FAMILY = 1;/g' "$PBXPROJ"
  echo "✓ Set iPhone-only (TARGETED_DEVICE_FAMILY = 1)"
else
  echo "• iPhone-only already set"
fi

# 2) Marketing version 1.0.0
sed -i.bak 's/MARKETING_VERSION = 1.0;/MARKETING_VERSION = 1.0.0;/g' "$PBXPROJ" || true

rm -f "$PBXPROJ.bak"

# 3) Sanity-check the privacy usage strings exist (added in Info.plist).
for key in NSCameraUsageDescription NSPhotoLibraryUsageDescription; do
  if grep -q "$key" "$INFO"; then
    echo "✓ $key present"
  else
    echo "⚠ $key MISSING from $INFO — add it before submitting." >&2
  fi
done

echo ""
echo "Done. Next: 'npm run icons' then 'npx cap open ios'."
echo "In Xcode: set your Team (Signing & Capabilities) and verify"
echo "Deployment Info shows iPhone only (no iPad)."
