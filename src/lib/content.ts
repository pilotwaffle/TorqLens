/**
 * TorqLens — canonical in-app copy.
 *
 * Single source of truth so the in-app screens, the safety sheet, and the
 * web /privacy + /support pages stay consistent and match the design handoff.
 * No bracket placeholders in user-facing strings. No AI-provider names.
 */

export const APP = {
  name: "TorqLens",
  subtitle: "AI Plant & Weed Scanner",
  company: "Torq Business Solutions",
  version: "1.0.0",
  year: "2026",
  supportEmail: "support@torqlens.app",
};

export const SAFETY_SHEET = {
  title: "A quick safety check",
  body: "AI identification can be wrong. Always verify the plant before applying herbicides or removing vegetation. Follow local laws, product labels, and safety instructions. Keep children, pets, pollinators, and waterways protected.",
  bullets: [
    "Confirm the ID with a second source",
    "Read the full product label",
    "Protect kids, pets & pollinators",
  ],
  primary: "I understand — show guidance",
  secondary: "Not now",
} as const;

export const RESULT_DISCLAIMER =
  "AI can be wrong — verify before any treatment.";

export const ABOUT = {
  heading: "About TorqLens",
  body: "TorqLens helps homeowners identify the plants, weeds, grasses, and flowers in their yard, and decide whether to grow or remove them — with safety first. It's a guidance tool, not a substitute for professional advice. Always verify before acting.",
  footer: `Version ${APP.version} · © ${APP.year} ${APP.company}`,
};

export const PRIVACY_IN_APP = {
  heading: "Privacy summary",
  intro:
    "Your photos are used only to identify plants. They are never sold or used for advertising.",
  howHeading: "How a scan works",
  how: [
    "You take a photo with the camera or pick one from your library.",
    "It's sent securely to our backend, which runs the AI analysis.",
    "You get a result — name, confidence, and guidance.",
  ],
  onDevice:
    "On your device: your scan history and saved results stay on your phone. TorqLens v1 has no account or login.",
};

export const SUPPORT_IN_APP = {
  heading: "Support",
  intro: "Need a hand? We usually reply within 1–2 business days.",
  email: APP.supportEmail,
  faq: [
    {
      q: "How accurate is identification?",
      a: "TorqLens uses AI and shows a confidence score plus alternatives. It can be wrong — always verify before acting, especially before removing or treating a plant.",
    },
    {
      q: "Why verify before removing?",
      a: "Look-alike plants are common. Confirm with a second source and follow local laws and product labels before using any herbicide.",
    },
    {
      q: "Where are my scans stored?",
      a: "Your history and saved scans stay on your device. Photos are sent securely only to perform identification and are not sold.",
    },
    {
      q: "Tips for a better result",
      a: "Fill the frame with one leaf or flower, use good light, and avoid blur.",
    },
  ],
  permissions:
    "Manage camera and photo access in iOS Settings → TorqLens.",
};
