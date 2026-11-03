import React from "react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "./demo-badge";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  isDemoData?: boolean;
  statusVariant?: "default" | "success" | "warning" | "danger";
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  isDemoData = true,
  statusVariant = "default",
  className,
}: MetricCardProps) {
  const getStatusBorder = () => {
    switch (statusVariant) {
      case "success":
        return "border-l-4 border-l-emerald-500";
      case "warning":
        return "border-l-4 border-l-amber-500";
      case "danger":
        return "border-l-4 border-l-rose-500";
      default:
        return "border-l-4 border-l-slate-300";
    }
  };

  return (
    <div
      className={cn(
        "relative bg-white rounded-lg border border-slate-200/90 p-4.5 shadow-xs transition-all hover:border-slate-300 hover:shadow-sm",
        getStatusBorder(),
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium tracking-wide uppercase text-slate-500 truncate">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {isDemoData && <DemoBadge />}
          {Icon && (
            <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-100 text-slate-600">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-[11px] font-medium",
              trend.isNeutral
                ? "text-slate-500"
                : trend.isPositive
                ? "text-emerald-700 font-semibold"
                : "text-rose-700 font-semibold"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-500 truncate" title={subtext}>
          {subtext}
        </p>
      )}
    </div>
  );
}
