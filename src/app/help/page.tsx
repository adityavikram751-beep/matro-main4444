"use client";

// import Footer from "@/components/Footer";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    "How do I create an account?",
    "How do I update my profile details?",
    "How does the matchmaking system work?",
    "How can I contact another member?",
    "Is my personal data safe?",
    "How do I delete my account?",
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* ---------------- HEADER ---------------- */}
      <div className="bg-[#FCEEEE] py-10 px-4 md:py-14 md:px-6 border-b border-red-100">
        <div className="max-w-6xl mx-auto flex items-start gap-4">
          <HelpCircle className="text-[#8B0000] w-10 h-10 hidden sm:block" />

          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#222]">
              Help & FAQ’s
            </h1>

            <p className="text-gray-700 text-[14px] sm:text-[15px] mt-2 max-w-xl">
              Find answers to common questions about our matrimonial services.
              Can't find what you're looking for? Our support team is here to help!
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col lg:flex-row gap-10">

        {/* ---------------- LEFT NAV ---------------- */}
        <div className="w-full lg:w-[300px] h-fit lg:sticky lg:top-28">
          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#222] mb-4">
              Help Topics
            </h2>

            <ol className="list-decimal space-y-2 sm:space-y-3 pl-5 text-[14px] sm:text-[15px] text-gray-700">
              <li>
                <a href="#section1" className="text-blue-600 underline">
                  Getting Started
                </a>
              </li>
              <li>Profile Management</li>
              <li>Matching & Search</li>
              <li>Communication</li>
              <li>Privacy & Safety</li>
            </ol>
          </div>
        </div>

        {/* ---------------- RIGHT CONTENT (FAQ Accordions) ---------------- */}
        <div className="flex-1 space-y-6 text-[14px] sm:text-[15px] text-[#333] leading-7">

          {faqs.map((q, i) => (
            <div key={i} className="border-b pb-4">
              {/* QUESTION ROW */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleFAQ(i)}
              >
                <p className="text-[15px] sm:text-[16px] font-medium">
                  {i + 1}. {q}
                </p>

                {openIndex === i ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>

              {/* ANSWER */}
              {openIndex === i && (
                <div className="mt-3 text-gray-600 pl-3 sm:pl-6 text-[13px] sm:text-[14px]">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>

                  <p className="mt-3">
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                    doloremque laudantium.
                  </p>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      {/* <Footer /> */}
    </>
  );
}
