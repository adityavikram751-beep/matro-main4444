"use client";
import { useState } from "react";
import ProfileVisitor from "./ProfileVisitor";
import ProfileIVisit from "./ProfileIVisit";

export default function Page() {
  const [activeTab, setActiveTab] = useState("Profile Visitors");

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ---------- Tabs (Responsive + Scrollable) ---------- */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div
          className="
            max-w-4xl mx-auto 
            px-4 
            flex 
            justify-evenly 
            gap-4 
            overflow-x-auto 
            scrollbar-hide 
          "
        >
          {["Profile Visitors", "Profile I Visited"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-3 
                whitespace-nowrap 
                text-sm font-medium 
                border-b-2 transition-all
                ${
                  activeTab === tab
                    ? "border-[#7D0A0A] text-[#7D0A0A] font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Content ---------- */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "Profile Visitors" ? <ProfileVisitor /> : <ProfileIVisit />}
      </div>
    </div>
  );
}
