"use client";

import { Sprout, ShieldCheck, ShieldAlert, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { Markdown } from "@/components/ui/markdown";
import type { GuidanceAction, GuidanceResult, PlantCandidate } from "@/lib/types";

/**
 * Grow / Remove-safely guidance screen.
 *
 * For "remove", a calm amber safety banner stays pinned at the top of the
 * guidance (the persistent reminder), and the user has already passed the
 * SafetySheet gate in the shell before reaching here. Matches reference 04.
 */
export function Guidance({
  action,
  candidate,
  loading,
  error,
  result,
  onRetry,
}: {
  action: GuidanceAction;
  candidate: PlantCandidate;
  loading: boolean;
  error: string | null;
  result: GuidanceResult | null;
  onRetry: () => void;
}) {
  const isGrow = action === "grow";
  return (
    <div className="px-5 pb-12">
      <div className="flex items-center gap-2 pt-1">
        <span
          className={
            "flex h-9 w-9 items-center justify-center rounded-xl " +
            (isGrow
              ? "bg-[#e7f4ec] text-leafdeep"
              : "bg-[#fdebd0] text-[#b46b14]")
          }
        >
          {isGrow ? (
            <Sprout className="h-5 w-5" />
          ) : (
            <ShieldCheck className="h-5 w-5" />
          )}
        </span>
        <div className="min-w-0">
          <h1 className="truncate text-[19px] font-extrabold text-foreground">
            {isGrow ? "How to grow" : "Remove safely"}
          </h1>
          <p className="truncate text-[13px] text-muted-foreground">
            {candidate.commonName || candidate.scientificName || "this plant"}
          </p>
        </div>
      </div>

      {/* Persistent safety banner for removal guidance */}
      {!isGrow && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[#fdebd0] px-3.5 py-3 text-[13.5px] leading-snug text-[#7a4a12]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Verify the plant first. Follow local laws &amp; product labels.
            Protect children, pets, pollinators &amp; waterways.
          </p>
        </div>
      )}

      <Card className="mt-4 px-5 py-5">
        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-leaf" />
            Preparing your {isGrow ? "growing" : "removal"} guide…
          </div>
        ) : error ? (
          <div className="py-2">
            <p className="text-sm font-semibold text-foreground">
              Couldn&apos;t load guidance
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="subtle"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : result ? (
          <Markdown>{result.content}</Markdown>
        ) : null}
      </Card>
    </div>
  );
}
