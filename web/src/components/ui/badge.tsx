import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all select-none shadow-raise-1 bg-[#F1F1EF] text-[#4A4A4F]",
  {
    variants: {
      variant: {
        default:
          "text-[#1D1D1F]",
        secondary:
          "text-[#8A8A90]",
        destructive:
          "text-[#D64545] border border-[#D64545]/40",
        outline:
          "border border-[#D4D4D1]",
        success:
          "text-[#2E9E6B] border border-[#2E9E6B]/40",
        warning:
          "text-[#D99A1E] border border-[#D99A1E]/40",
        accent:
          "text-[#2F6FE0] border border-[#2F6FE0]/40",
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
