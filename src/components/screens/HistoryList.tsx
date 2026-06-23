"use client";

import { Clock, Heart, Trash2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mono, CategoryBadge } from "@/components/ui/primitives";
import type { ScanRecord } from "@/lib/types";

/**
 * Shared list view for History and Saved/Favorites. Each row: thumbnail,
 * common name, "94% match · <when>", category pill. Matches reference 05.
 */
export function HistoryList({
  variant,
  records,
  onOpen,
  onToggleFavorite,
  onDelete,
  onClear,
  onScan,
}: {
  variant: "history" | "saved";
  records: ScanRecord[];
  onOpen: (r: ScanRecord) => void;
  onToggleFavorite: (r: ScanRecord) => void;
  onDelete: (r: ScanRecord) => void;
  onClear?: () => void;
  onScan: () => void;
}) {
  const saved = variant === "saved";
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-8 pt-24 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f4ec] text-leaf">
          {saved ? <Heart className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
        </span>
        <h2 className="text-lg font-bold text-foreground">
          {saved ? "No saved scans yet" : "No scans yet"}
        </h2>
        <p className="mt-1.5 max-w-xs text-[14px] text-muted-foreground">
          {saved
            ? "Tap the heart on a result to keep it here for quick reference."
            : "Your scans are saved on this device so you can revisit them anytime."}
        </p>
        <Button className="mt-5" size="lg" onClick={onScan}>
          Scan a plant
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 pb-8">
      <div className="flex items-center justify-between pb-3 pt-1">
        <h1 className="text-2xl font-extrabold text-foreground">
          {saved ? "Saved" : "History"}
        </h1>
        {!saved && onClear && (
          <button
            onClick={onClear}
            className="text-sm font-semibold text-muted-foreground"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {records.map((r) => (
          <div
            key={r.id}
            className="group flex items-center gap-3 rounded-2xl bg-card p-2.5 shadow-[0_2px_14px_-10px_rgba(43,45,66,0.35)]"
          >
            <button
              onClick={() => onOpen(r)}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <Thumb src={r.thumbnail} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-foreground">
                  {r.primary.commonName || "Unknown plant"}
                </p>
                <p className="text-[12px] text-muted-foreground">
                  <Mono>{r.primary.matchPercent}% match</Mono>
                  <span> · {relativeWhen(r.createdAt)}</span>
                </p>
              </div>
            </button>
            <CategoryBadge category={r.primary.category} />
            <div className="flex items-center">
              <button
                onClick={() => onToggleFavorite(r)}
                aria-label={r.favorite ? "Unsave" : "Save"}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-black/5"
              >
                <Heart
                  className={
                    r.favorite
                      ? "h-[18px] w-[18px] fill-caution text-caution"
                      : "h-[18px] w-[18px]"
                  }
                />
              </button>
              <button
                onClick={() => onDelete(r)}
                aria-label="Delete"
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 hover:bg-black/5 hover:text-caution"
              >
                <Trash2 className="h-[17px] w-[17px]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Thumb({ src }: { src?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img src={src} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
    );
  }
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e7f4ec] text-leaf">
      <Leaf className="h-5 w-5" />
    </span>
  );
}

/** Render an epoch-ms timestamp as a friendly relative string. */
function relativeWhen(ts: number): string {
  // `now` is read at render — fine for display; no persistence dependency.
  const now = Date.now();
  const diff = Math.max(0, now - ts);
  const day = 86_400_000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (ts >= startOfToday.getTime()) return "Today";
  if (ts >= startOfToday.getTime() - day) return "Yesterday";
  const days = Math.floor(diff / day);
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
