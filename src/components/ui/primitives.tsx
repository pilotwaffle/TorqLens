"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { PlantCategory } from "@/lib/types";

/** White rounded surface card. */
export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-card text-card-foreground shadow-[0_2px_20px_-8px_rgba(43,45,66,0.18)]",
        className
      )}
      {...props}
    />
  );
}

/** Small pill badge. */
export function Badge({
  className,
  tone = "slate",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "leaf" | "amber" | "slate" | "caution" | "navy";
}) {
  const tones: Record<string, string> = {
    leaf: "bg-[#e7f4ec] text-leafdeep",
    amber: "bg-[#fdebd0] text-[#b46b14]",
    slate: "bg-[#eef1f4] text-[#4b5563]",
    caution: "bg-[#ffe2e6] text-caution",
    navy: "bg-[#e7e9f0] text-navy",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

/** Confidence/match bar used in "other possibilities" + result. */
export function MatchBar({
  percent,
  className,
}: {
  percent: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-[#e6ebef]",
        className
      )}
    >
      <div
        className="animate-bar h-full rounded-full bg-leaf"
        style={{ width: `${Math.max(4, Math.min(100, percent))}%` }}
      />
    </div>
  );
}

/** Visual chip mapping a category to a tone + label. */
const CATEGORY_TONE: Record<
  PlantCategory,
  { label: string; tone: "leaf" | "amber" | "slate" | "navy" }
> = {
  weed: { label: "Weed", tone: "amber" },
  grass: { label: "Grass", tone: "navy" },
  flower: { label: "Flower", tone: "leaf" },
  shrub: { label: "Shrub", tone: "leaf" },
  tree: { label: "Tree", tone: "leaf" },
  succulent: { label: "Succulent", tone: "leaf" },
  other: { label: "Plant", tone: "slate" },
};

export function CategoryBadge({
  category,
  className,
}: {
  category: PlantCategory;
  className?: string;
}) {
  const m = CATEGORY_TONE[category] ?? CATEGORY_TONE.other;
  return (
    <Badge tone={m.tone} className={className}>
      {m.label}
    </Badge>
  );
}

/** Mono text helper for percentages / scientific names. */
export function Mono({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("font-mono", className)} {...props} />;
}
