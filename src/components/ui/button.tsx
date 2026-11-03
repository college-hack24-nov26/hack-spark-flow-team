import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 active:bg-emerald-800",
        forest:
          "bg-[#0B2319] text-[#E5EFEA] border border-[#184131] hover:bg-[#123728] active:bg-[#071912]",
        destructive:
          "bg-rose-600 text-white shadow-xs hover:bg-rose-700 active:bg-rose-800",
        outline:
          "border border-slate-200 bg-white text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-300",
        secondary:
          "bg-slate-100 text-slate-900 shadow-xs hover:bg-slate-200/80",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link:
          "text-emerald-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm: "h-7 rounded-md px-2.5 text-[11px]",
        lg: "h-10 rounded-md px-5 text-sm",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
