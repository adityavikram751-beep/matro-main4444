import React from 'react';
import Image from 'next/image';

const NearbyMatchesPage: React.FC = () => {
  // Example data for nearby matches
  const matches = [
    { name: 'Karan Patel', distance: '2 km away', image: 'https://randomuser.me/api/portraits/men/4.jpg' },
    { name: 'Meena Joshi', distance: '5 km away', image: 'https://randomuser.me/api/portraits/women/5.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div
        className="
          max-w-3xl mx-auto 
          bg-white 
          rounded-2xl 
          shadow-sm 
          p-4 sm:p-6
        "
      >
        <h2
          className="
            text-xl sm:text-2xl 
            font-bold 
            mb-6 
            text-gray-900
          "
        >
          Nearby Matches
        </h2>

        <ul className="space-y-4">
          {matches.map((match, idx) => (
            <li
              key={idx}
              className="
                flex items-center gap-3 sm:gap-4 
                p-3 sm:p-4 
                bg-orange-50 
                rounded-xl 
                shadow-sm 
                hover:shadow-md 
                transition-all
              "
            >
              <Image
                src={match.image}
                alt={match.name}
                width={56}
                height={56}
                className="
                  w-12 h-12 
                  sm:w-14 sm:h-14 
                  rounded-full 
                  object-cover
                "
              />

              <div className="flex flex-col">
                <div className="font-semibold text-gray-800 text-sm sm:text-base">
                  {match.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  {match.distance}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NearbyMatchesPage;
