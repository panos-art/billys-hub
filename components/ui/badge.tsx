import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#1C4E89] text-white",
        secondary: "bg-gray-100 text-gray-700",
        success: "bg-[#7BCFB5]/20 text-emerald-700",
        warning: "bg-[#F39257]/20 text-orange-700",
        destructive: "bg-red-100 text-red-700",
        info: "bg-[#00B1C9]/20 text-cyan-700",
        outline: "border border-gray-200 text-gray-700",
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
