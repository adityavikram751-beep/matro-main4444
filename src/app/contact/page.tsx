import Footer from "@/components/Footer";
import { Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      {/* ---------- HEADER ---------- */}
      <div className="bg-[#FCEEEE] py-16 px-6 border-b border-red-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-4">
            <Phone className="text-[#8B0000] w-9 h-9 mt-1" />

            <div>
              <h1 className="text-3xl font-bold text-[#2A2A2A]">Contact Us</h1>

              <p className="text-gray-700 text-[15px] mt-2">
                Feel free to get in touch with us.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- MAP + DETAILS ---------- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 py-14 px-6">

        {/* LEFT MAP (FULL WIDTH, CLEAN HEIGHT) */}
        <div className="relative w-full h-[430px] rounded-lg overflow-hidden border border-gray-300 shadow-sm">

          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.548686108793!2d77.31831387528947!3d28.583090675687146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5cf0e2d3f1b%3A0xa478e4ce06cfaf!2sSector%202%2C%20Noida%2C%20Uttar%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000"
            allowFullScreen
            loading="lazy"
          ></iframe>

          {/* CENTER BUTTON */}
          <a
            href="https://maps.google.com"
            target="_blank"
            className="absolute top-[55%] left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded shadow text-sm font-medium"
          >
            View on google map
          </a>
        </div>

        {/* RIGHT CONTACT INFO (CENTERED VERTICALLY & SPACED) */}
        <div className="flex flex-col justify-center space-y-5 text-[17px] text-[#2A2A2A] leading-relaxed pr-4">
          <p className="font-medium">
            2nd Floor, 108 Sector 2, Noida 201301, UP
          </p>

          <p className="font-medium">+91 9999999999</p>

          <a href="mailto:contactus@gmail.com" className="text-blue-600 underline">
            contactus@gmail.com
          </a>
        </div>
      </div>

      {/* ---------- SPACING BEFORE FOOTER (SUPER IMPORTANT) ---------- */}
      <div className="h-10"></div>

      {/* ---------- FOOTER ---------- */}
      <Footer />
    </>
  );
}
