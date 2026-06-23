"use client";

import { ShieldCheck, Check } from "lucide-react";
import { BottomSheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SAFETY_SHEET } from "@/lib/content";

/**
 * Native-style "quick safety check" sheet. Shown BEFORE any remove/herbicide
 * guidance. Calm, not scary: soft amber shield, plain reassurance, two clear
 * choices. Exact copy from the design handoff.
 */
export function SafetySheet({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <BottomSheet open={open} onClose={onCancel} labelledBy="safety-title">
      <div className="pb-2">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdebd0] text-[#b46b14]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 id="safety-title" className="text-xl font-bold text-foreground">
          {SAFETY_SHEET.title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-foreground/75">
          {SAFETY_SHEET.body}
        </p>

        <ul className="mt-4 space-y-2">
          {SAFETY_SHEET.bullets.map((b) => (
            <li
              key={b}
              className="flex items-center gap-2.5 text-sm font-medium text-foreground/80"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e7f4ec] text-leafdeep">
                <Check className="h-3 w-3" />
              </span>
              {b}
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-2.5">
          <Button size="lg" className="w-full" onClick={onConfirm}>
            {SAFETY_SHEET.primary}
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={onCancel}
          >
            {SAFETY_SHEET.secondary}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
