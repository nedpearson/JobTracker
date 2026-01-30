import * as React from "react";
import { cn } from "@/lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "glass min-h-28 w-full resize-y rounded-xl px-3 py-2 text-sm outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/20 placeholder:text-white/30",
        className
      )}
      {...props}
    />
  );
});

