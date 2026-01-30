import * as React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const base =
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-black hover:bg-white/90 focus:ring-white/30 shadow-[0_10px_30px_rgba(255,255,255,0.08)]",
  secondary: "bg-white/10 text-white hover:bg-white/14 ring-1 ring-white/12",
  ghost: "bg-transparent text-white/80 hover:bg-white/10 ring-1 ring-white/10",
  danger: "bg-red-500 text-white hover:bg-red-400"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3",
  md: "h-10 px-4"
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (asChild) {
    const child = React.Children.only(props.children);
    if (!React.isValidElement(child)) return null;
    return React.cloneElement(child, {
      className: cn(classes, (child.props as { className?: string }).className)
    });
  }
  return <button className={classes} {...props} />;
}

