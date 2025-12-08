import * as React from "react";

export function Select({ value, onValueChange, children, ...props }: { value: string; onValueChange: (value: string) => void; children: React.ReactNode; [key: string]: unknown }) {
  return (
    <select
      value={value}
      onChange={e => onValueChange?.(e.target.value)}
      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-red-500 focus:ring-red-500"
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
  return <option value="" disabled hidden>{placeholder}</option>;
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  return <option value={value}>{children}</option>;
} 