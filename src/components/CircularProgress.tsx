import React from 'react';
interface CircularProgressProps {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}
const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max,
  color,
  size = 80,
  strokeWidth = 8
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <>
    <div className="relative inline-block">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F3F4F6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out "
        />
      </svg>
    </div>
    <div className='absolute'>
        <img src='public/Images/love.png' alt=''/>
    </div>
    </>
  )
};
export default CircularProgress;