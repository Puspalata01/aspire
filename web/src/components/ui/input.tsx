import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-full bg-[#E2E2E0] px-5 py-3 text-sm text-[#1D1D1F] placeholder:text-[#8A8A90] border border-[#D4D4D1] shadow-sink-1 transition-all duration-160 focus:outline-none focus:border-[#2F6FE0] focus:shadow-sink-2 focus:ring-2 focus:ring-[#2F6FE0] disabled:cursor-not-allowed disabled:shadow-none disabled:text-[#8A8A90] disabled:bg-[#E9E9E7]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
