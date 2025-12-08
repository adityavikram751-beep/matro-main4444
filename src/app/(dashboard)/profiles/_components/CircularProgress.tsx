import React from "react";

interface CircularProgressProps {
  value: number;
  max: number;
  color?: string;          // stroke color
  size?: number;           // full circle size
  strokeWidth?: number;    // thickness
  showText?: boolean;      // center percentage
  textClassName?: string;  // custom text style
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  color = "#dc2626",   // Default Red-600 (rose theme)
  size = 80,
  strokeWidth = 8,
  showText = true,
  textClassName = "text-gray-800 font-semibold"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb" // gray-300
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>

      {/* Center Text */}
      {showText && (
        <span className={`absolute text-sm ${textClassName}`}>
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

export default CircularProgress;
