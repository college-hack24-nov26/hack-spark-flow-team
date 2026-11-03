import React from "react";
import { cn } from "@/lib/utils";

interface DemoBadgeProps {
  className?: string;
  variant?: "subtle" | "prominent" | "pill";
  label?: string;
}

export function DemoBadge({
  className,
  variant = "subtle",
  label = "DEMO DATA",
}: DemoBadgeProps) {
  if (variant === "prominent") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-300 shadow-xs",
          className
        )}
        title="This figure is loaded from the Golden Demo dataset for testing purposes."
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        {label}
      </span>
    );
  }

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200",
          className
        )}
        title="Demonstration record"
      >
        {label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium tracking-tight uppercase bg-amber-50/80 text-amber-800 border border-amber-200/80",
        className
      )}
      title="Verified demo scenario value"
    >
      <span className="w-1 h-1 rounded-full bg-amber-500" />
      {label}
    </span>
  );
}
