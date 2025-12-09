import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* ---------------- HEADER ---------------- */}
      <div className="bg-[#FCEEEE] py-14 px-6 border-b border-red-100">
        <div className="max-w-6xl mx-auto flex items-start gap-4">
          <Shield className="text-[#8B0000] w-9 h-9" />

          <div>
            <h1 className="text-3xl font-semibold text-[#222]">Privacy Policy</h1>

            <p className="text-gray-700 text-[15px] mt-2">
              Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information.
            </p>

            <p className="text-gray-500 text-sm mt-4">
              Last Updated : <span className="font-medium">09 December, 2025</span>
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
              Quick Navigation
            </h2>

            <ol className="list-decimal space-y-3 pl-4 text-[15px] text-gray-700 leading-6">
              <li>
                <a href="#section1" className="text-blue-600 underline">
                  What information do we collect from you?
                </a>
              </li>
              <li>How we use information we collect?</li>
              <li>How we secure your information?</li>
              <li>How long we keep your information?</li>
              <li>Cookies and other tracking Tools.</li>
              <li>How we transfer information Internationally?</li>
              <li>Contact Us</li>
            </ol>

          </div>
        </div>

        {/* ---------------- RIGHT SCROLLING CONTENT ---------------- */}
        <div className="flex-1 space-y-16 text-[15px] leading-7 text-[#333]">

          {/* SECTION 1 */}
          <div id="section1">
            <h2 className="text-xl font-semibold mb-4">
              1. What information do we collect from you?
            </h2>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...
            </p>

            <p className="mt-4">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium...
            </p>
          </div>

          {/* MULTIPLE MORE SECTIONS */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i}>
              <h2 className="text-xl font-semibold mb-4">
                {i + 1}. What information do we collect from you?
              </h2>

              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit...
              </p>

              <p className="mt-4">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium...
              </p>
            </div>
          ))}

        </div>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      <Footer />
    </>
  );
}
