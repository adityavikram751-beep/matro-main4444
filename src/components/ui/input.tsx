import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`
        block w-full 
        rounded-md border border-gray-300 
        shadow-sm
        outline-none
        transition-all

        /* BASE STYLES */
        px-3 py-2 text-base

        /* RESPONSIVE PADDING */
        sm:px-4 sm:py-2.5
        md:px-4.5 md:py-3
        lg:px-5 lg:py-3.5

        /* RESPONSIVE FONT SIZE */
        text-sm
        sm:text-base
        md:text-lg

        /* FOCUS RING */
        focus:border-red-500 
        focus:ring-2 focus:ring-red-500/60

        /* DISABLED STYLE */
        disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70

        ${className}
      `}
      {...props}
    />
  );
});

Input.displayName = "Input";
