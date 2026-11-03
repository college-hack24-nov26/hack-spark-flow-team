import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border border-transparent bg-emerald-50 text-emerald-800 border-emerald-200",
        secondary:
          "border border-transparent bg-slate-100 text-slate-800 border-slate-200",
        destructive:
          "border border-transparent bg-rose-50 text-rose-800 border-rose-200",
        warning:
          "border border-transparent bg-amber-50 text-amber-800 border-amber-200",
        outline:
          "text-slate-700 border border-slate-200 bg-white",
        forest:
          "bg-[#0E2C20] text-[#E5EFEA] border border-[#1B4A37]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
