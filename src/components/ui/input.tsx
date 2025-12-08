import * as React from "react";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-red-500 focus:ring-red-500 ${className || ''}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input"; 