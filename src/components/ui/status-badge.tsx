import React from "react";
import { cn } from "@/lib/utils";

export type TraceStatusType =
  | "RELEASED"
  | "PASSED"
  | "QUARANTINE"
  | "RECALLED"
  | "FLAGGED"
  | "PENDING"
  | "PROCESSING"
  | "EXHAUSTED"
  | "ACTIVE"
  | "RESOLVED";

interface StatusBadgeProps {
  status: TraceStatusType | string;
  size?: "sm" | "default";
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  size = "default",
  pulse = false,
  className,
}: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case "RELEASED":
      case "PASSED":
      case "ACTIVE":
      case "RESOLVED":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
        };
      case "QUARANTINE":
      case "PENDING":
      case "PROCESSING":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
        };
      case "RECALLED":
      case "FLAGGED":
      case "CRITICAL":
        return {
          bg: "bg-rose-50 text-rose-800 border-rose-200",
          dot: "bg-rose-500",
        };
      case "EXHAUSTED":
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const style = getStyle();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-md font-mono uppercase tracking-wider",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
        style.bg,
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          style.dot,
          pulse && "animate-pulse"
        )}
      />
      {status}
    </span>
  );
}
