import Link from "next/link";
import type { Metadata } from "next";
import { APP } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy — TorqLens",
  description:
    "How TorqLens handles your photos and data. We use scan photos only to identify plants — never sold, never used for advertising or tracking.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <header>
        <p className="text-2xl font-extrabold text-foreground">{APP.name}</p>
        <p className="mt-1 text-[15px] text-foreground/60">{APP.subtitle}</p>
      </header>

      <hr className="my-8 border-border" />

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        Privacy Policy
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        Last updated: June 2026 · {APP.company}
      </p>

      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        TorqLens (&quot;we&quot;, &quot;us&quot;) provides an app that identifies
        plants, weeds, grasses, and flowers from a photo. This policy explains
        what we collect and how we use it.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">
        Photos you scan
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        When you scan, your photo is sent securely to our backend, which performs
        AI analysis to identify the plant and returns a result. Photos are sent
        securely to identify your plant and are used only to provide that
        identification. They are not sold or used for advertising.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">On-device data</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        Your scan history and saved results are stored on your device, not on our
        servers.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">Diagnostics</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        TorqLens v1 does not include third-party advertising or tracking SDKs.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">No accounts</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        TorqLens v1 has no login, so we do not collect names or passwords.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">Children</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        TorqLens is rated 4+ and is not directed at children; we do not knowingly
        collect data from children.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">Your choices</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-foreground/80">
        <li>Clear your scan history at any time in the app.</li>
        <li>Revoke camera and photo permissions in iOS Settings.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-foreground">
        How we answer the App Store privacy questions
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-foreground/80">
        <li>
          Data collected: <strong>Photos</strong>, used for app functionality
          (plant identification) only.
        </li>
        <li>Not used for tracking.</li>
        <li>Not sold.</li>
        <li>No third-party advertising.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-foreground">Contact</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        Questions about this policy? Email us at{" "}
        <a
          href={`mailto:${APP.supportEmail}`}
          className="text-leafdeep underline"
        >
          {APP.supportEmail}
        </a>
        .
      </p>

      <hr className="my-8 border-border" />

      <footer className="text-[15px] text-foreground/60">
        <p>© 2026 {APP.company}</p>
        <p className="mt-2">
          <Link href="/support" className="text-leafdeep underline">
            Support
          </Link>
        </p>
      </footer>
    </main>
  );
}
