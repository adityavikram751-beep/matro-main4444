import React from 'react';
import Image from 'next/image';
import CircularProgress from '../app/(dashboard)/profiles/_components/CircularProgress';

interface UserDetail {
  label: string;
  value: string;
  bgColor: string;
}

interface CompatibilityParam {
  name: string;
  description: string;
  score: number;
  maxScore: number;
  color: string;
}

const CompatibilityCard: React.FC = () => {
  const userDetails: UserDetail[] = [
    { label: 'Time of Birth', value: '08:00 AM', bgColor: 'bg-pink-100' },
    { label: 'Place of Birth', value: 'Delhi, Delhi-NCR, India', bgColor: 'bg-blue-100' },
    { label: 'Manglik', value: "Don't Know", bgColor: 'bg-purple-100' },
    { label: 'Rashi', value: 'Leo', bgColor: 'bg-yellow-100' },
    { label: 'Nakshatra', value: 'Mrigasira', bgColor: 'bg-green-100' },
  ];

  const compatibilityParams: CompatibilityParam[] = [
    { name: 'Bhakoot', description: 'Love', score: 2, maxScore: 7, color: '#EC4899' },
    { name: 'Varna', description: 'Compatibility', score: 1, maxScore: 1, color: '#F97316' },
    { name: 'Nadi', description: 'Health', score: 2, maxScore: 8, color: '#06B6D4' },
    { name: 'Maitri', description: 'Mental Compatibility', score: 2, maxScore: 5, color: '#84CC16' },
    { name: 'Vashya', description: 'Dominance', score: 2, maxScore: 2, color: '#EAB308' },
    { name: 'Gana', description: 'Temperament', score: 2, maxScore: 6, color: '#8B5CF6' },
    { name: 'Tara', description: 'Destiny', score: 2, maxScore: 3, color: '#A855F7' },
    { name: 'Yoni', description: 'Physical Compatibility', score: 2, maxScore: 4, color: '#DC2626' },
  ];

  const totalScore = compatibilityParams.reduce((sum, param) => sum + param.score, 0);
  const maxTotalScore = compatibilityParams.reduce((sum, param) => sum + param.maxScore, 0);

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* CARD */}
        <div className="bg-[#F9F9F9] rounded-2xl shadow-xl p-6 sm:p-8">

          {/* TITLE */}
          <h1 className="text-lg sm:text-xl font-medium text-center text-gray-800 mb-6">
            Your Compatibility with Shivank G
          </h1>

          {/* PROFILE SECTION */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-10">
            
            {/* Female Profile */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-lg border-4 border-white">
              <Image
                src="https://images.pexels.com/photos/3671083/pexels-photo-3671083.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Female profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Middle Score Section */}
            <div className="flex flex-col items-center">
              <Image
                src="/Images/Rings.png"
                alt="Rings"
                width={31}
                height={31}
                className="w-6 sm:w-[31px] mt-3"
              />

              <Image
                src="/Images/Dotted.png"
                alt="Dotted line"
                width={100}
                height={10}
                className="w-24 sm:w-[100px] object-contain"
              />

              <div className="text-2xl sm:text-4xl font-bold text-pink-500 mt-1">
                {totalScore}.5 / {maxTotalScore}
              </div>
            </div>

            {/* Male Profile */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-lg border-4 border-white">
              <Image
                src="https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Male profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* USER DETAILS */}
          <div className="mb-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700 mb-3">
              Predictions are based on your details.
            </h2>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {userDetails.map((detail, index) => (
                <div
                  key={index}
                  className={`${detail.bgColor} rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-gray-700 shadow`}
                >
                  {detail.label}: <span className="text-gray-800">{detail.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COMPATIBILITY GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {compatibilityParams.map((param, index) => (
              <div key={index} className="text-center">

                <div className="flex justify-center mb-3">
                  <CircularProgress
                    value={param.score}
                    max={param.maxScore}
                    color={param.color}
                    size={70}
                    strokeWidth={7}
                  />
                </div>

                <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-1">
                  {param.name} – {param.description}
                </h3>

                <div
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: param.color }}
                >
                  {param.score}/{param.maxScore}
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompatibilityCard;
