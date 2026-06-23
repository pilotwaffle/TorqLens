"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger" | "subtle" | "light";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-leaf text-white hover:bg-leafdeep active:scale-[0.99] shadow-sm",
  outline:
    "border border-caution text-caution bg-white hover:bg-[#fff1f2] active:scale-[0.99]",
  danger:
    "bg-caution text-white hover:bg-[#b80323] active:scale-[0.99]",
  ghost: "text-foreground/80 hover:bg-black/5 active:scale-[0.99]",
  subtle:
    "bg-secondary text-secondary-foreground hover:bg-[#e3ebed] active:scale-[0.99]",
  light:
    "bg-white/10 text-white hover:bg-white/15 active:scale-[0.99] backdrop-blur",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-xl gap-1.5",
  md: "h-11 px-4 text-[15px] rounded-2xl gap-2",
  lg: "h-13 px-5 text-base rounded-2xl gap-2",
  icon: "h-10 w-10 rounded-full",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition-all disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
