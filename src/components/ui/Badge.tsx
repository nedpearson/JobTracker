import * as React from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-white/80 ring-1 ring-white/15",
        className
      )}
    >
      {children}
    </span>
  );
}

