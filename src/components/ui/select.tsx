import * as React from "react";

export function Select({
  value,
  onValueChange,
  children,
  className = "",
  ...props
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`
        block w-full 
        rounded-lg 
        border border-gray-300 
        bg-white
        px-3 py-2.5 
        text-base sm:text-sm        /* responsive font */
        shadow-sm 
        focus:border-red-500 
        focus:ring-red-500 
        transition-all 
        cursor-pointer
        
        sm:px-3 sm:py-2             /* tablet size */
        md:px-4 md:py-2.5           /* desktop size */
        
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

export function SelectTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectValue({ placeholder }: { placeholder: string }) {
  return (
    <option value="" disabled hidden>
      {placeholder}
    </option>
  );
}

export function SelectItem({
  value,
  children,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <option
      value={value}
      className={`
        text-gray-700 
        bg-white
        py-2 sm:py-2 md:py-2.5     /* responsive item height */
        ${className}
      `}
    >
      {children}
    </option>
  );
}
