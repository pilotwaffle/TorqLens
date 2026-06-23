"use client";

import Image from "next/image";
import { Camera, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * First-run value-prop screen on the dark scanner surface.
 * Copy tightened to "grow or remove safely" per the design handoff.
 */
export function Onboarding({ onStart }: { onStart: () => void }) {
  return (
    <div className="surface-scanner pt-safe pb-safe flex min-h-dvh flex-col px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Image
          src="/brand/badge-256.png"
          alt="TorqLens"
          width={84}
          height={84}
          priority
          className="mb-6 drop-shadow-lg"
        />
        <h1 className="text-[34px] font-extrabold leading-[1.08] tracking-tight text-white text-balance">
          Know what&apos;s growing in your yard
        </h1>
        <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-white/70 text-balance">
          Snap or upload a photo of any plant, weed, grass, or flower and get an
          instant AI ID — plus simple guidance to grow or remove safely.
        </p>

        <ul className="mt-9 w-full max-w-xs space-y-3 text-left">
          {[
            {
              icon: Camera,
              t: "Snap or upload",
              d: "Use your camera or photo library.",
            },
            {
              icon: Sparkles,
              t: "Instant AI identification",
              d: "Confidence score and likely alternatives.",
            },
            {
              icon: ShieldCheck,
              t: "Safety first",
              d: "A quick check before any removal guidance.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <li key={t} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-signal">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-white">{t}</p>
                <p className="text-[13px] leading-snug text-white/55">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="pb-4">
        <Button size="lg" className="w-full" onClick={onStart}>
          Get started
        </Button>
        <p className="mt-3 text-center text-[12px] text-white/45">
          A product of Torq Business Solutions
        </p>
      </div>
    </div>
  );
}
