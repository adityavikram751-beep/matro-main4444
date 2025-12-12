import React from 'react';
import Link from 'next/link';

type Stat = { number: string; label: string; color?: string };

interface StatsSectionProps {
  stats: Stat[];
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <div
      className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        gap-4 sm:gap-6 
        my-6
      "
    >
      {stats.slice(0, 2).map((stat, index) => {
        let href = "#";

        switch (stat.label) {
          case "Profile Visits":
            href = "/profiles/profile-visits";
            break;
          case "Wishlist":
            href = "/profiles/Wishlist";
            break;
          case "Not-Now":
            href = "/profiles/not-now";
            break;
        }

        return (
          <Link key={index} href={href}>
            <div
              className="
                bg-white 
                border-[3px] border-[#B5343F]
                rounded-[28px]
                
                /* Responsive height */
                h-36 sm:h-44 
                
                flex flex-col items-center justify-center 
                px-4 
                
                shadow-[0_6px_20px_rgba(0,0,0,0.05)]
                hover:shadow-[0_8px_25px_rgba(0,0,0,0.12)]
                transition-all 
                hover:scale-[1.02]
                cursor-pointer
              "
            >
              {/* Number Circle */}
              <div
                className="
                  w-12 h-12 sm:w-14 sm:h-14 
                  flex items-center justify-center 
                  rounded-full 
                  bg-[#FDECEC]
                  text-[#B5343F]
                  text-xl sm:text-2xl 
                  font-bold
                  mb-2
                "
              >
                {stat.number}
              </div>

              {/* Label */}
              <p
                className="
                  text-base sm:text-lg 
                  font-semibold 
                  text-gray-800 
                  font-Lato 
                  tracking-wide 
                  text-center
                  leading-snug
                "
              >
                {stat.label}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default StatsSection;
