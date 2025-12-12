import * as React from "react";

// ⭐ MAIN CARD WRAPPER (RESPONSIVE)
export function Card({
  className = "",
  hover = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={`
        bg-[#FFF8F0]
        rounded-xl sm:rounded-2xl md:rounded-3xl     /* 🔥 Responsive radius */
        shadow-[0_2px_6px_rgba(0,0,0,0.04)] 
        sm:shadow-[0_4px_12px_rgba(0,0,0,0.05)] 
        md:shadow-[0_6px_18px_rgba(0,0,0,0.07)]     /* 🔥 Responsive shadow */

        border border-[#f0e4dd]
        transition-all duration-300

        ${hover ? "hover:shadow-[0_10px_24px_rgba(0,0,0,0.10)]" : ""}  /* Hover upgrade */
        ${className}
      `}
      {...props}
    />
  );
}

// ⭐ CARD CONTENT (RESPONSIVE)
export function CardContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`
        p-4 sm:p-6 md:p-8         /* 🔥 Responsive padding */
        ${className}
      `}
      {...props}
    />
  );
}
