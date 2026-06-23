"use client";

import { Camera, ImageIcon, Leaf } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, Mono, CategoryBadge } from "@/components/ui/primitives";
import type { ScanRecord } from "@/lib/types";

/**
 * Home / scan screen. Big, native-feeling capture affordances + a peek at the
 * most recent scans. Light surface.
 */
export function Home({
  recent,
  onCapture,
  onPick,
  onOpenScan,
  onSeeAll,
}: {
  recent: ScanRecord[];
  onCapture: () => void;
  onPick: () => void;
  onOpenScan: (r: ScanRecord) => void;
  onSeeAll: () => void;
}) {
  return (
    <div className="px-5 pb-8">
      <section className="pt-2 text-center">
        <h1 className="text-[27px] font-extrabold leading-tight tracking-tight text-foreground text-balance">
          What&apos;s growing in your yard?
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-[15px] text-muted-foreground text-balance">
          Take or upload a clear, well-lit close-up. We&apos;ll identify it and
          help you grow or remove it safely.
        </p>
      </section>

      {/* Capture card */}
      <Card className="mt-6 overflow-hidden">
        <div className="surface-scanner relative flex flex-col items-center justify-center gap-1 px-6 py-10 text-center">
          {/* scan-frame corner brackets */}
          <ScanCorners />
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-signal">
            <Camera className="h-8 w-8" />
          </span>
          <p className="mt-3 text-[15px] font-semibold text-white">
            Add a photo of your plant
          </p>
          <p className="max-w-[15rem] text-[13px] leading-snug text-white/55">
            Fill the frame with one leaf or flower for the best match.
          </p>
        </div>
        <div className="flex gap-2.5 p-4">
          <Button size="lg" className="flex-1" onClick={onCapture}>
            <Camera className="h-5 w-5" />
            Take photo
          </Button>
          <Button
            size="lg"
            variant="subtle"
            className="flex-1"
            onClick={onPick}
          >
            <ImageIcon className="h-5 w-5" />
            Upload
          </Button>
        </div>
      </Card>

      {/* Recent peek */}
      {recent.length > 0 && (
        <section className="mt-7">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Recent scans
            </h2>
            <button
              onClick={onSeeAll}
              className="text-sm font-semibold text-leafdeep"
            >
              See all
            </button>
          </div>
          <div className="space-y-2.5">
            {recent.slice(0, 3).map((r) => (
              <button
                key={r.id}
                onClick={() => onOpenScan(r)}
                className="flex w-full items-center gap-3 rounded-2xl bg-card p-2.5 text-left shadow-[0_2px_14px_-10px_rgba(43,45,66,0.35)] active:scale-[0.995]"
              >
                <Thumb src={r.thumbnail} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {r.primary.commonName || "Unknown plant"}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    <Mono>{r.primary.matchPercent}% match</Mono>
                  </p>
                </div>
                <CategoryBadge category={r.primary.category} />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Thumb({ src }: { src?: string }) {
  if (src) {
    // Stored thumbnails are local data URLs; <img> avoids next/image loader.
    return (
      <img
        src={src}
        alt=""
        className="h-12 w-12 shrink-0 rounded-xl object-cover"
      />
    );
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e7f4ec] text-leaf">
      <Leaf className="h-5 w-5" />
    </span>
  );
}

export function ScanCorners() {
  const base =
    "absolute h-7 w-7 border-signal/70 pointer-events-none";
  return (
    <>
      <span className={`${base} left-4 top-4 rounded-tl-lg border-l-2 border-t-2`} />
      <span className={`${base} right-4 top-4 rounded-tr-lg border-r-2 border-t-2`} />
      <span className={`${base} bottom-4 left-4 rounded-bl-lg border-b-2 border-l-2`} />
      <span className={`${base} bottom-4 right-4 rounded-br-lg border-b-2 border-r-2`} />
    </>
  );
}
