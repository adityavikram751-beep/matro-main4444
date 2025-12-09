'use client';

import Image from "next/image";

export default function WhyChooseUs() {
  const benefits = [
    { img: "/Images/Rings.png", title: "100% Free" },
    { img: "/Images/Rings.png", title: "No Pressure, No Ads" },
    { img: "/Images/Rings.png", title: "Verified Profiles" },
    { img: "/Images/Rings.png", title: "Respectful Community" },
    { img: "/Images/Rings.png", title: "Focused on Real Marriages" },
  ];

  return (
    <section id="why-us" className="py-20 bg-[#FFF8F1]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* TITLE */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-[#A11200] mb-14">
          Why Choose Us?
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT BENEFITS LIST */}
          <div className="space-y-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#FDEEE5] transition"
              >
                <Image
                  src={benefit.img}
                  alt="Benefit Icon"
                  width={32}
                  height={32}
                  className="flex-shrink-0"
                />

                <p className="text-lg font-semibold text-gray-800">
                  {benefit.title}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/Images/Image1.png"
                alt="Happy Couple"
                width={800}
                height={500}
                className="rounded-2xl shadow-xl w-full h-[480px] object-cover"
              />
            </div>

            {/* BACK SHADOW GRADIENT */}
            <div className="absolute -bottom-4 -left-4 w-full h-full bg-gradient-to-tr from-[#F6D8A8] to-[#F2B98A] rounded-2xl -z-10"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
