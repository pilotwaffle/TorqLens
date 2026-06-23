/**
 * TorqLens — native bridges (Capacitor).
 *
 * Each function degrades gracefully on the web (dev in a browser) and uses the
 * native plugin on device. The web fallbacks use standard browser APIs
 * (<input> file pickers, the Web Share API) so the whole flow is testable
 * without a device.
 */
import { Capacitor } from "@capacitor/core";

export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

export function isIOS(): boolean {
  return Capacitor.getPlatform() === "ios";
}

/** Light haptic tap (no-op on web). */
export async function tapHaptic(): Promise<void> {
  try {
    if (!isNative()) return;
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    /* haptics are best-effort */
  }
}

export async function successHaptic(): Promise<void> {
  try {
    if (!isNative()) return;
    const { Haptics, NotificationType } = await import("@capacitor/haptics");
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    /* best-effort */
  }
}

type CaptureSource = "camera" | "library";

/**
 * Capture or pick a photo. Returns a base64 data URL, or null if cancelled.
 * On native iOS this triggers the system camera / photo-library permission
 * prompts (Info.plist strings declared in scripts/configure-ios.sh).
 */
export async function capturePhoto(source: CaptureSource): Promise<string | null> {
  if (isNative()) {
    const { Camera, CameraResultType, CameraSource } = await import(
      "@capacitor/camera"
    );
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === "camera" ? CameraSource.Camera : CameraSource.Photos,
        // We do our own compression; ask for a reasonable capture size.
        width: 2000,
        correctOrientation: true,
        presentationStyle: "fullscreen",
      });
      return photo.dataUrl ?? null;
    } catch {
      // User cancelled or denied — treat as no selection.
      return null;
    }
  }

  // ── Web fallback: hidden file input ───────────────────────────────
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (source === "camera") input.capture = "environment";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    // If the dialog is dismissed without a file, we simply never resolve to a
    // value here; callers guard with their own UI state. To avoid a hung
    // promise, resolve(null) on window focus return without a file.
    const onFocus = () => {
      window.removeEventListener("focus", onFocus);
      setTimeout(() => {
        if (!input.files || input.files.length === 0) resolve(null);
      }, 400);
    };
    window.addEventListener("focus", onFocus);
    input.click();
  });
}

/**
 * Share a result via the native iOS share sheet (or Web Share API on web).
 * Text-only by default; this keeps it dependency-light and avoids leaking the
 * user's photo unless they explicitly attach it elsewhere.
 */
export async function shareResult(opts: {
  title: string;
  text: string;
}): Promise<void> {
  if (isNative()) {
    const { Share } = await import("@capacitor/share");
    try {
      await Share.share({
        title: opts.title,
        text: opts.text,
        dialogTitle: "Share result",
      });
    } catch {
      /* user dismissed */
    }
    return;
  }
  // Web fallback
  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
  };
  if (nav.share) {
    try {
      await nav.share({ title: opts.title, text: opts.text });
    } catch {
      /* dismissed */
    }
  } else {
    try {
      await navigator.clipboard.writeText(`${opts.title}\n${opts.text}`);
    } catch {
      /* no-op */
    }
  }
}

/** Configure the iOS status bar to match the current surface. */
export async function setStatusBar(style: "dark" | "light"): Promise<void> {
  try {
    if (!isNative()) return;
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    // style "dark" => dark CONTENT (for light backgrounds); "light" => light content
    await StatusBar.setStyle({
      style: style === "dark" ? Style.Dark : Style.Light,
    });
  } catch {
    /* best-effort */
  }
}

/** Hide the splash screen once the app shell is interactive. */
export async function hideSplash(): Promise<void> {
  try {
    if (!isNative()) return;
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* best-effort */
  }
}
