"use client";

import * as React from "react";
import Image from "next/image";
import {
  Info,
  Shield,
  ShieldCheck,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
  Mail,
  Lock,
  FileText,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  APP,
  ABOUT,
  PRIVACY_IN_APP,
  SUPPORT_IN_APP,
  SAFETY_SHEET,
} from "@/lib/content";

type View = "menu" | "privacy" | "support" | "safety";

/**
 * About / More hub.
 *
 * Self-contained: an internal `view` switches between the menu and the three
 * read-only reference sub-screens (Privacy summary, Support, Safety
 * disclaimer). Light surface, navy ink, leaf + amber accents to match the rest
 * of the app. All copy comes verbatim from @/lib/content.
 */
export function About() {
  const [view, setView] = React.useState<View>("menu");

  return (
    <div className="px-5 pb-10 pt-2">
      {view === "menu" && <Menu onOpen={setView} />}
      {view === "privacy" && <Privacy onBack={() => setView("menu")} />}
      {view === "support" && <Support onBack={() => setView("menu")} />}
      {view === "safety" && <Safety onBack={() => setView("menu")} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared sub-screen header                                            */
/* ------------------------------------------------------------------ */

function BackBar({ onBack }: { onBack: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="-ml-2 mb-1" onClick={onBack}>
      <ChevronLeft className="h-4 w-4" />
      Back
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[56px] w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-black/[0.03] active:bg-black/[0.05]"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f4ec] text-leafdeep">
        {icon}
      </span>
      <span className="flex-1 text-[15px] font-semibold text-foreground">
        {label}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </button>
  );
}

function Menu({ onOpen }: { onOpen: (v: View) => void }) {
  return (
    <>
      {/* Brand block */}
      <div className="flex flex-col items-center pt-4 text-center">
        <Image
          src="/brand/badge-256.png"
          alt="TorqLens"
          width={72}
          height={72}
          className="rounded-2xl"
        />
        <h1 className="mt-3 text-[26px] font-extrabold tracking-tight text-foreground">
          {APP.name}
        </h1>
        <p className="text-[14px] font-medium text-muted-foreground">
          {APP.subtitle}
        </p>
        <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-foreground/85">
          {ABOUT.body}
        </p>
        <p className="mt-3 text-[12px] text-muted-foreground">{ABOUT.footer}</p>
      </div>

      {/* Rows */}
      <Card className="mt-7 divide-y divide-black/[0.06] overflow-hidden p-0">
        <MenuRow
          icon={<Shield className="h-5 w-5" />}
          label="Privacy summary"
          onClick={() => onOpen("privacy")}
        />
        <MenuRow
          icon={<LifeBuoy className="h-5 w-5" />}
          label="Support & help"
          onClick={() => onOpen("support")}
        />
        <MenuRow
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Safety disclaimer"
          onClick={() => onOpen("safety")}
        />
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy summary                                                     */
/* ------------------------------------------------------------------ */

function Privacy({ onBack }: { onBack: () => void }) {
  const openPolicy = () => {
    try {
      window.open("/privacy", "_blank");
    } catch {
      /* no-op: in-app, the web page may be unreachable */
    }
  };

  return (
    <>
      <BackBar onBack={onBack} />

      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f4ec] text-leafdeep">
          <Lock className="h-5 w-5" />
        </span>
        <h1 className="text-[20px] font-extrabold text-foreground">
          {PRIVACY_IN_APP.heading}
        </h1>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
        {PRIVACY_IN_APP.intro}
      </p>

      <Card className="mt-5 px-5 py-5">
        <h2 className="text-[15px] font-bold text-foreground">
          {PRIVACY_IN_APP.howHeading}
        </h2>
        <ol className="mt-3 space-y-3">
          {PRIVACY_IN_APP.how.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e7f4ec] text-[13px] font-bold text-leafdeep">
                {i + 1}
              </span>
              <span className="text-[15px] leading-relaxed text-foreground/85">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      <p className="mt-5 text-[15px] leading-relaxed text-foreground/85">
        {PRIVACY_IN_APP.onDevice}
      </p>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[#e7f4ec] px-4 py-3 text-[13.5px] leading-snug text-leafdeep">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Photos are sent securely to identify your plant and are never sold.
        </p>
      </div>

      <Button
        variant="subtle"
        size="md"
        className="mt-6 w-full"
        onClick={openPolicy}
      >
        <FileText className="h-4 w-4" />
        Read the full Privacy Policy
      </Button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Support & help                                                      */
/* ------------------------------------------------------------------ */

function Support({ onBack }: { onBack: () => void }) {
  return (
    <>
      <BackBar onBack={onBack} />

      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e7f4ec] text-leafdeep">
          <LifeBuoy className="h-5 w-5" />
        </span>
        <h1 className="text-[20px] font-extrabold text-foreground">
          {SUPPORT_IN_APP.heading}
        </h1>
      </div>

      <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">
        {SUPPORT_IN_APP.intro}
      </p>

      <a
        href={`mailto:${SUPPORT_IN_APP.email}`}
        className="mt-4 flex min-h-[52px] items-center gap-3 rounded-2xl bg-[#e7f4ec] px-4 py-3 text-leafdeep"
      >
        <Mail className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-[15px] font-semibold">
          {SUPPORT_IN_APP.email}
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 opacity-70" />
      </a>

      <h2 className="mt-7 text-[13px] font-bold uppercase tracking-wide text-muted-foreground">
        Frequently asked
      </h2>
      <div className="mt-3 space-y-3">
        {SUPPORT_IN_APP.faq.map((item) => (
          <Card key={item.q} className="px-5 py-4">
            <p className="text-[15px] font-bold text-foreground">{item.q}</p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-[13px] leading-relaxed text-muted-foreground">
        {SUPPORT_IN_APP.permissions}
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Safety disclaimer                                                   */
/* ------------------------------------------------------------------ */

function Safety({ onBack }: { onBack: () => void }) {
  return (
    <>
      <BackBar onBack={onBack} />

      <div className="flex items-center gap-2.5">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fdebd0] text-[#b46b14]">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <Badge tone="amber">Safety</Badge>
          <h1 className="mt-1 text-[20px] font-extrabold text-foreground">
            {SAFETY_SHEET.title}
          </h1>
        </div>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-foreground/85">
        {SAFETY_SHEET.body}
      </p>

      <Card className="mt-5 px-5 py-5">
        <ul className="space-y-3">
          {SAFETY_SHEET.bullets.map((b) => (
            <li
              key={b}
              className={cn(
                "flex items-center gap-3 text-[15px] font-medium text-foreground/85"
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fdebd0] text-[#b46b14]">
                <Check className="h-3.5 w-3.5" />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#fdebd0] px-4 py-3 text-[13.5px] leading-snug text-[#7a4a12]">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>AI can be wrong &mdash; always verify a plant before you act.</p>
      </div>
    </>
  );
}
