import type { CapacitorConfig } from "@capacitor/cli";

/**
 * TorqLens — Capacitor (iOS) configuration.
 *
 * The web shell is exported statically to `out/` (via `npm run cap:build`)
 * and copied into the native iOS project by `cap sync`. The app calls the
 * REMOTE backend for identification — no API keys or secrets are present in
 * this client bundle.
 */
const config: CapacitorConfig = {
  appId: "com.torqbusinesssolutions.torqlens",
  appName: "TorqLens",
  webDir: "out",
  // iPhone-only is enforced in Xcode (TARGETED_DEVICE_FAMILY = 1) and via the
  // post-add patch in scripts/configure-ios.sh.
  ios: {
    contentInset: "always",
    backgroundColor: "#2b2d42",
    // We render our own in-app safe-area-aware chrome; keep the native scroll
    // bounce but avoid the webview overscrolling white.
    scrollEnabled: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 600,
      backgroundColor: "#2b2d42",
      showSpinner: false,
      iosSpinnerStyle: "small",
    },
    Camera: {
      // Permission strings are declared in Info.plist (see scripts/configure-ios.sh).
    },
  },
};

export default config;
