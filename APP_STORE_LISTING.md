# TorqLens — App Store Connect, copy-paste metadata

Live URLs (already deployed):
- **Privacy Policy URL:** https://torqlens.vercel.app/privacy
- **Support URL:** https://torqlens.vercel.app/support
- **Marketing URL (optional):** leave blank or use https://torqlens.vercel.app

App record: **TorqLens** · Bundle ID `com.torqbusinesssolutions.torqlens` ·
SKU `torqlens-ios-001` · iOS · English (U.S.).

---

## App Information page (left sidebar → General → App Information)

- **Name:** `TorqLens`
- **Subtitle:** `AI Plant & Weed Scanner`
- **Category:** Primary **Utilities** · Secondary **Lifestyle**
- **Content Rights:** does not use third-party content → No
- **Age Rating:** complete the questionnaire → answer **No** to everything → **4+**
- **Privacy Policy URL:** `https://torqlens.vercel.app/privacy`

---

## Version page (1.0 Prepare for Submission) — the page you're on

**Promotional Text** *(optional, editable anytime without review; 170 char max)*
```
Point your camera at any plant, weed, grass, or flower and get an instant AI ID — plus simple, safety-first guidance on whether to grow it or remove it.
```

**Description**
```
TorqLens helps homeowners identify what's growing in their yard. Take or upload a photo of a plant, weed, grass, or flower and get an AI-powered identification — plus practical guidance on whether to grow it or remove it safely.

WHAT YOU CAN DO
• Scan with your camera or upload from your library
• Get an instant ID with a confidence score and likely alternatives
• See clear "Grow it" care tips or step-by-step "Remove safely" guidance
• Keep a private history of every scan, on your device
• Save your favorite results

SAFETY FIRST
TorqLens shows a safety reminder before any removal or herbicide guidance. AI can be wrong — always verify a plant before applying any product or removing vegetation, and follow local laws and product labels.

PRIVACY
Your scan history stays on your device. Photos are sent securely only to identify your plant and are never sold.

TorqLens is a guidance tool, not a substitute for professional advice. A product of Torq Business Solutions.
```

**Keywords** *(100 char max, comma-separated, no spaces after commas)*
```
plant identifier,weed scanner,lawn care,gardening,flower id,grass id,yard,plant ai,identify
```

**Support URL:** `https://torqlens.vercel.app/support`
**Marketing URL:** *(leave blank, optional)*

**Version:** `1.0`
**Copyright:** `2026 Torq Business Solutions`

---

## Screenshots (this page → Previews and Screenshots)

Leave EMPTY until the TestFlight build runs. Then capture from the REAL app and
upload at least the iPhone 6.5" / 6.9" set (Apple needs one supported size).
Suggested order/captions:
1. Know what's growing in your yard
2. Snap or upload a photo
3. Instant AI identification
4. Grow it — or remove it safely
5. Every scan saved on device

> The PNGs in the design handoff are launch-direction references only — do not
> upload them as final store screenshots.

---

## App Privacy page (left sidebar → App Privacy) — REQUIRED before submit

Click **Get Started** and answer:
- **Do you collect data from this app?** → **Yes**
- Data type collected: **Photos or Videos → Photos**
  - Used for: **App Functionality** (plant identification)
  - Linked to the user's identity? **No**
  - Used for tracking? **No**
- No other data types (no contact info, no identifiers, no location, no
  analytics SDK in v1).
- This matches the published policy at /privacy. If you later add a crash/
  analytics SDK, declare it here too.

---

## Pricing and Availability (left sidebar → Pricing and Availability) — REQUIRED

- **Price:** Free (Tier 0)
- **Availability:** All countries/regions (or your choice)

---

## App Review Information (on the version page, scroll down) — REQUIRED before submit

- **Sign-in required?** **No** (v1 has no account/login)
- **Contact info:** your name, phone, email (Apple uses this only if the
  reviewer needs to reach you)
- **Notes for reviewer** (paste):
```
TorqLens identifies plants, weeds, grasses, and flowers from a photo and provides grow or remove-safely guidance. No account or login is required. The app uses the device camera and photo library (permission prompts shown on first use) and sends the photo to our backend for AI identification. A safety reminder is shown before any removal/herbicide guidance. Scan history and saved results are stored only on the device.
```

---

## Order of operations
1. Fill App Information, Version text fields, App Privacy, Pricing (all above — no Mac needed).
2. Build + upload to TestFlight from the cloud Mac (CLOUD_MAC_QUICKSTART.md),
   backend URL = https://torqlens.vercel.app
3. Capture real screenshots from the TestFlight build → upload here.
4. Select the build on the version page → Add for Review → Submit.

© 2026 Torq Business Solutions.
