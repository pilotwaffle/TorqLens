"use client";

import { ScanCorners } from "./Home";

/**
 * Analyzing state — dark scanner surface, the captured photo under a sweeping
 * scan line + corner brackets, mono status subtext. Matches reference
 * screenshot 03 ("Analyzing… detecting leaf shape · matching species").
 */
export function Analyzing({ image }: { image: string }) {
  return (
    <div className="surface-scanner pt-safe pb-safe flex min-h-dvh flex-col items-center justify-center px-8">
      <div className="relative aspect-square w-full max-w-[16rem] overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt="Your photo"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0">
          <ScanCorners />
          {/* sweeping scan line */}
          <div className="animate-scan absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-signal/40 to-transparent" />
        </div>
      </div>

      <p className="mt-7 text-lg font-bold text-white">Analyzing…</p>
      <p className="mt-1 font-mono text-[12px] tracking-wide text-white/55">
        detecting leaf shape · matching species
      </p>

      <div className="mt-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
