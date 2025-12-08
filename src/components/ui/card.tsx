import * as React from "react";

// MAIN CARD WRAPPER
export function Card({
  className = "",
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={`
        bg-[#FFF8F0] 
        rounded-2xl 
        shadow-[0_4px_12px_rgba(0,0,0,0.04)]
        border border-[#f0e4dd]
        transition-all
        ${hover ? "hover:shadow-[0_6px_18px_rgba(0,0,0,0.07)]" : ""}
        ${className}
      `}
      {...props}
    />
  );
}

// CARD CONTENT WRAPPER
export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props} />
  );
}
