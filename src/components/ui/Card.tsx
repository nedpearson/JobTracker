import * as React from "react";
import { cn } from "@/lib/cn";

export function Card({
  className,
  title,
  description,
  children
}: {
  className?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("glass rounded-2xl p-4 outline-soft", className)}>
      {(title || description) && (
        <header className="mb-2">
          {title && <h2 className="text-sm font-semibold">{title}</h2>}
          {description && <p className="text-muted mt-0.5 text-sm">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

