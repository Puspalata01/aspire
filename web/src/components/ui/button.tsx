import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all duration-160 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6FE0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#E9E9E7] disabled:pointer-events-none disabled:bg-[#E9E9E7] disabled:text-[#8A8A90] disabled:shadow-none cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#8E8E93] text-[#1D1D1F] shadow-raise-2 hover:bg-[#9C9CA1] hover:shadow-raise-3 active:bg-[#E9E9E7] active:shadow-sink-1",
        soft:
          "bg-[#F1F1EF] text-[#1D1D1F] shadow-raise-1 hover:shadow-raise-2 active:bg-[#E9E9E7] active:shadow-sink-1",
        outline:
          "bg-[#F1F1EF] text-[#1D1D1F] border border-[#D4D4D1] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1",
        secondary:
          "bg-[#F1F1EF] text-[#4A4A4F] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1",
        ghost:
          "text-[#4A4A4F] hover:bg-[#F1F1EF] hover:shadow-raise-1 active:shadow-sink-1",
        accent:
          "bg-[#2F6FE0] text-white shadow-raise-2 hover:brightness-105 hover:shadow-raise-3 active:shadow-sink-1 font-semibold",
        emergency:
          "bg-[#F1F1EF] text-[#D64545] border-2 border-[#D64545] font-bold shadow-raise-2 hover:shadow-raise-3 active:shadow-sink-1",
        destructive:
          "bg-[#F1F1EF] text-[#D64545] shadow-raise-1 hover:shadow-raise-2 active:shadow-sink-1",
      },
      size: {
        default: "h-11 px-8 py-3 text-sm",
        sm: "h-8 rounded-full px-4 text-xs",
        lg: "h-14 rounded-full px-10 text-base font-semibold",
        icon: "h-10 w-10 p-0 rounded-full",
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
