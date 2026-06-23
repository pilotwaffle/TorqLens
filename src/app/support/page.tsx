import Link from "next/link";
import type { Metadata } from "next";
import { APP } from "@/lib/content";

export const metadata: Metadata = {
  title: "Support — TorqLens",
  description:
    "Get help with TorqLens. Email support, FAQ on identification accuracy, scan storage, permissions, and tips for a better result.",
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <header>
        <p className="text-2xl font-extrabold text-foreground">{APP.name}</p>
        <p className="mt-1 text-[15px] text-foreground/60">{APP.subtitle}</p>
      </header>

      <hr className="my-8 border-border" />

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
        Support
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        Get help with TorqLens. Email us at{" "}
        <a
          href={`mailto:${APP.supportEmail}`}
          className="text-leafdeep underline"
        >
          {APP.supportEmail}
        </a>{" "}
        and we&apos;ll reply within 1–2 business days.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">
        How accurate is identification?
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        TorqLens uses AI and shows a confidence score plus alternatives. It can
        be wrong — always verify before acting, especially before removing or
        treating a plant.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">
        Why verify before removing?
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        Look-alike plants are common. Confirm with a second source and follow
        local laws and product labels before using any herbicide. To remove a
        plant safely, read the full product label and protect kids, pets, and
        pollinators.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">
        Where are my scans stored?
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        Your history and saved scans stay on your device. Photos are sent
        securely to identify your plant and are used only to provide that
        identification. They are not sold or used for advertising.
      </p>

      <h2 className="mt-8 text-lg font-bold text-foreground">
        Tips for a better result
      </h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] text-foreground/80">
        <li>Fill the frame with one leaf or flower.</li>
        <li>Use good light.</li>
        <li>Avoid blur.</li>
      </ul>

      <h2 className="mt-8 text-lg font-bold text-foreground">Permissions</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
        Manage camera and photo access in iOS Settings → TorqLens.
      </p>

      <hr className="my-8 border-border" />

      <footer className="text-[15px] text-foreground/60">
        <p>© 2026 {APP.company}</p>
        <p className="mt-2">
          <Link href="/privacy" className="text-leafdeep underline">
            Privacy Policy
          </Link>
        </p>
      </footer>
    </main>
  );
}
