"use client";

import { Sprout, ShieldCheck, Share2, Heart, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  Mono,
  MatchBar,
  CategoryBadge,
  Badge,
} from "@/components/ui/primitives";
import { RESULT_DISCLAIMER } from "@/lib/content";
import type { IdentifyResult, PlantCandidate } from "@/lib/types";

/**
 * Result screen — the product centerpiece. Photo hero with a "94% match" pill,
 * a white result card (name + scientific name + category), description,
 * Grow it / Remove safely actions, and "OTHER POSSIBILITIES" alternatives.
 * Matches reference screenshot 01.
 */
export function Result({
  image,
  result,
  activeIndex,
  favorite,
  onSelectCandidate,
  onGrow,
  onRemove,
  onShare,
  onToggleFavorite,
  onNewScan,
}: {
  image: string;
  result: IdentifyResult;
  activeIndex: number;
  favorite: boolean;
  onSelectCandidate: (i: number) => void;
  onGrow: () => void;
  onRemove: () => void;
  onShare: () => void;
  onToggleFavorite: () => void;
  onNewScan: () => void;
}) {
  const active: PlantCandidate | null =
    result.candidates[activeIndex] ?? result.primary;

  if (!result.isPlant || !active) {
    return <NotAPlant onNewScan={onNewScan} />;
  }

  const others = result.candidates
    .map((c, i) => ({ c, i }))
    .filter(({ i }) => i !== activeIndex);

  return (
    <div className="px-4 pb-10">
      {/* Hero photo with match pill */}
      <div className="relative mt-1 aspect-[4/3] w-full overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Your scan" className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/55 to-transparent" />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-white backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-signal" />
          <Mono className="text-[13px] font-semibold">
            {active.matchPercent}% match
          </Mono>
        </span>
        <button
          onClick={onToggleFavorite}
          aria-label={favorite ? "Remove from saved" : "Save result"}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur active:scale-95"
        >
          <Heart
            className={favorite ? "h-5 w-5 fill-caution text-caution" : "h-5 w-5"}
          />
        </button>
      </div>

      {/* Result card */}
      <Card className="-mt-6 relative px-5 pb-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[26px] font-extrabold leading-tight text-foreground">
              {active.commonName || "Unknown plant"}
            </h1>
            {active.scientificName && (
              <Mono className="text-[13px] italic text-muted-foreground">
                {active.scientificName}
              </Mono>
            )}
          </div>
          <CategoryBadge category={active.category} className="mt-1 shrink-0" />
        </div>

        {active.shortDescription && (
          <p className="mt-3 rounded-2xl bg-secondary/70 px-3.5 py-3 text-[14px] leading-relaxed text-foreground/80">
            {active.shortDescription}
          </p>
        )}

        {active.keyTraits.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {active.keyTraits.slice(0, 5).map((t) => (
              <Badge key={t} tone="slate" className="normal-case tracking-normal">
                {t}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-2.5">
          <Button className="flex-1" size="lg" onClick={onGrow}>
            <Sprout className="h-5 w-5" />
            Grow it
          </Button>
          <Button
            className="flex-1"
            size="lg"
            variant="outline"
            onClick={onRemove}
          >
            <ShieldCheck className="h-5 w-5" />
            Remove safely
          </Button>
        </div>
      </Card>

      {/* Other possibilities */}
      {others.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-2 px-1 text-[12px] font-bold uppercase tracking-wide text-slate-500">
            Other possibilities
          </h2>
          <Card className="divide-y divide-border px-1">
            {others.map(({ c, i }) => (
              <button
                key={i}
                onClick={() => onSelectCandidate(i)}
                className="flex w-full items-center gap-3 px-3 py-3 text-left active:bg-black/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-foreground">
                    {c.commonName || c.scientificName || "Unknown"}
                  </p>
                  <div className="mt-1.5 max-w-[8rem]">
                    <MatchBar percent={c.matchPercent} />
                  </div>
                </div>
                <Mono className="text-[13px] font-semibold text-muted-foreground">
                  {c.matchPercent}%
                </Mono>
              </button>
            ))}
          </Card>
        </section>
      )}

      {/* Disclaimer + utility row */}
      <div className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        {RESULT_DISCLAIMER}
      </div>
      <div className="mt-4 flex gap-2.5">
        <Button variant="subtle" size="md" className="flex-1" onClick={onShare}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="ghost" size="md" className="flex-1" onClick={onNewScan}>
          <RotateCcw className="h-4 w-4" />
          New scan
        </Button>
      </div>
    </div>
  );
}

function NotAPlant({ onNewScan }: { onNewScan: () => void }) {
  return (
    <div className="px-5 pb-10 pt-4">
      <Card className="px-5 py-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdebd0] text-[#b46b14]">
          <Info className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-foreground">
          That doesn&apos;t look like a plant
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-[14px] text-muted-foreground">
          Try another photo of a plant, weed, grass, or flower — get close
          enough that the leaves and stems are clearly visible.
        </p>
        <Button className="mt-5 w-full" size="lg" onClick={onNewScan}>
          Try another photo
        </Button>
      </Card>
    </div>
  );
}
