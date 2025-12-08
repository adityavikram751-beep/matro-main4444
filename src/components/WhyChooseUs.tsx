'use client';

import Image from 'next/image';

export default function WhyChooseUs() {
  const benefits = [
    { img: "/Images/Rings.png", title: "100% Free" },
    { img: "/Images/Rings.png", title: "No Pressure, No Ads" },
    { img: "/Images/Rings.png", title: "Verified Profiles" },
    { img: "/Images/Rings.png", title: "Respectful Community" },
    { img: "/Images/Rings.png", title: "Focused on Real Marriages" }
  ];

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Us?
              </h2>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform">
                     <Image
                     src= {benefit.img}
                     alt={`Rings`}
                     width={30}
                     height={30}/>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {benefit.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/Images/Image1.png"
                alt="Happy couple in traditional attire"
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                width={800}
                height={500}
              />
            </div>
            <div className="absolute -bottom-4 -left-4 w-full h-full bg-gradient-to-tr from-yellow-200 to-orange-200 rounded-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}