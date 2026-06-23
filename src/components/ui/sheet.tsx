"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Native-style iOS bottom sheet: dimmed backdrop, rounded top corners,
 * grab handle, slide-up animation, safe-area aware. Closes on backdrop tap
 * and Escape.
 */
export function BottomSheet({
  open,
  onClose,
  children,
  className,
  dismissable = true,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  dismissable?: boolean;
  labelledBy?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, dismissable]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        tabIndex={-1}
        className="animate-fade absolute inset-0 bg-black/45"
        onClick={() => dismissable && onClose()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "animate-sheet-up pb-safe relative w-full max-w-md rounded-t-[28px] bg-white px-5 pt-3 shadow-2xl",
          className
        )}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#d6dbe1]" />
        {children}
      </div>
    </div>
  );
}
