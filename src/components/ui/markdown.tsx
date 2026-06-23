"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

/** Renders guidance markdown with TorqLens typography. */
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-3 text-[15px] leading-relaxed text-foreground/85",
        className
      )}
    >
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h3 className="pt-2 text-[15px] font-bold text-foreground">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="pt-1 text-sm font-bold text-foreground">{children}</h4>
          ),
          ul: ({ children }) => (
            <ul className="ml-4 list-disc space-y-1 marker:text-leaf">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-4 list-decimal space-y-1 marker:text-leaf">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          p: ({ children }) => <p>{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          a: ({ children }) => (
            <span className="text-leafdeep underline">{children}</span>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
