"use client";

import Footer from "@/components/Footer";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    "How do I create an account ?",
    "How do I create an account ?",
    "How do I create an account ?",
    "How do I create an account ?",
    "How do I create an account ?",
    "How do I create an account ?",
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      {/* ---------------- HEADER ---------------- */}
      <div className="bg-[#FCEEEE] py-14 px-6 border-b border-red-100">
        <div className="max-w-6xl mx-auto flex items-start gap-4">
          <HelpCircle className="text-[#8B0000] w-10 h-10" />

          <div>
            <h1 className="text-3xl font-semibold text-[#222]">Help & FAQ’s</h1>

            <p className="text-gray-700 text-[15px] mt-2 max-w-xl">
              Find answers to common questions about our matrimonial services.
              Can't find what you're looking for? Our support team is here to help!
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- MAIN CONTENT LAYOUT ---------------- */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-10">

        {/* ---------------- LEFT STICKY NAVIGATION ---------------- */}
        <div className="w-[300px] h-fit sticky top-28">
          <div className="bg-white shadow-md border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-[#222] mb-4">
              Help Topics
            </h2>

            <ol className="list-decimal space-y-3 pl-4 text-[15px] text-gray-700 leading-6">
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

        {/* ---------------- RIGHT CONTENT WITH ACCORDIONS ---------------- */}
        <div className="flex-1 space-y-6 text-[15px] leading-7 text-[#333]">

          {faqs.map((q, i) => (
            <div key={i} className="border-b pb-4">
              {/* QUESTION ROW */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleFAQ(i)}
              >
                <p className="text-[16px]">{i + 1}. {q}</p>

                {openIndex === i ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </div>

              {/* ANSWER */}
              {openIndex === i && (
                <div className="mt-3 text-gray-600 pl-6 text-[14px]">
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                    quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>

                  <p className="mt-3">
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                    doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.
                  </p>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <Footer />
    </>
  );
}
