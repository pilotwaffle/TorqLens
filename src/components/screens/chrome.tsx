"use client";

import Image from "next/image";
import { ChevronLeft, Home, Clock, Heart, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = "home" | "history" | "saved" | "about";

/** Compact in-app top bar with the TorqLens nav mark + optional back button. */
export function AppHeader({
  title,
  onBack,
  right,
  dark = false,
}: {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <header
      className={cn(
        "pt-safe sticky top-0 z-30",
        dark ? "bg-transparent" : "bg-background/85 backdrop-blur-md"
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-2">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Back"
              className={cn(
                "-ml-1.5 flex h-9 w-9 items-center justify-center rounded-full",
                dark ? "text-white hover:bg-white/10" : "hover:bg-black/5"
              )}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          ) : (
            <Image
              src="/brand/nav-mark-256.png"
              alt="TorqLens"
              width={30}
              height={30}
              className="rounded-lg"
              priority
            />
          )}
          <span
            className={cn(
              "truncate text-[17px] font-bold",
              dark ? "text-white" : "text-foreground"
            )}
          >
            {title ?? "TorqLens"}
          </span>
        </div>
        {right}
      </div>
    </header>
  );
}

/** Bottom tab bar (home / history / saved / about). */
export function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
    { key: "home", label: "Scan", icon: Home },
    { key: "history", label: "History", icon: Clock },
    { key: "saved", label: "Saved", icon: Heart },
    { key: "about", label: "About", icon: Info },
  ];
  return (
    <nav className="pb-safe sticky bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
        {tabs.map(({ key, label, icon: Icon }) => {
          const on = active === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition-colors",
                on ? "text-leafdeep" : "text-slate-400"
              )}
              aria-current={on ? "page" : undefined}
            >
              <Icon className={cn("h-[22px] w-[22px]", on && "fill-[#e7f4ec]")} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
