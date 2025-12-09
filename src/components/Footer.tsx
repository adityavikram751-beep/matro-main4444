// src/components/Footer.tsx
import React from "react";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { FaInstagram, FaFacebook, FaWhatsapp, FaXTwitter } from "react-icons/fa6";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FFF8F1] text-[#2A2A2A] py-14 px-6">

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-12">

        {/* LEFT COLUMN */}
        <div className="col-span-1 space-y-6">
          <h2 className="text-[#A11200] text-4xl font-bold">.logo</h2>

          <p className="text-[15px] text-[#4b4b4b] leading-relaxed w-60">
            Where meaningful connections
            lead to lifelong bonds.
          </p>

          {/* EMAIL + PHONE WORKING */}
          <div className="space-y-4 pt-2">

            {/* EMAIL */}
            <a
              href="mailto:agensi@mail.com"
              className="flex items-center gap-3 hover:text-[#A11200] transition"
            >
              <Mail className="w-5 h-5 text-[#A11200]" />
              <span className="text-sm">agensi@mail.com</span>
            </a>

            {/* PHONE */}
            <a
              href="tel:+1234567890"
              className="flex items-center gap-3 hover:text-[#A11200] transition"
            >
              <Phone className="w-5 h-5 text-[#A11200]" />
              <span className="text-sm">+12 3456 7890</span>
            </a>

          </div>
        </div>

        {/* SUPPORT */}
        <div>
          <h3 className="text-[16px] font-semibold text-[#7A7A7A]">Support</h3>
          <ul className="text-sm space-y-4 mt-4">
            <li><Link href="/help" className="hover:text-[#A11200]">Help & FAQs</Link></li>
            <li><Link href="/contact" className="hover:text-[#A11200]">Contact Us</Link></li>
          </ul>
        </div>

      {/* COMPANY */}
<div>
  <h3 className="text-[16px] font-semibold text-[#7A7A7A]">Company</h3>
  <ul className="text-sm space-y-4 mt-4">
    <li>
      <Link href="/about" className="hover:text-[#A11200]">
        About Us
      </Link>
    </li>

    <li>
      <a href="/#why-us" className="hover:text-[#A11200]">
        Why Choose Us ?
      </a>
    </li>

    <li>
      <a href="/#success-stories" className="hover:text-[#A11200]">
        Success Stories
      </a>
    </li>
  </ul>
</div>


        {/* LEGAL + SOCIAL */}
        <div>
          <h3 className="text-[16px] font-semibold text-[#7A7A7A]">Legal</h3>
          <ul className="text-sm space-y-4 mt-4">
            <li><Link href="/privacy" className="hover:text-[#A11200]">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-[#A11200]">Terms & Conditions</Link></li>
          </ul>

          {/* SOCIAL ICONS — Working Links */}
          <div className="flex gap-4 mt-10">

            <Link href="https://instagram.com" target="_blank">
              <FaInstagram className="text-[#A11200] w-6 h-6 hover:text-pink-500 cursor-pointer" />
            </Link>

            <Link href="https://facebook.com" target="_blank">
              <FaFacebook className="text-[#A11200] w-6 h-6 hover:text-blue-600 cursor-pointer" />
            </Link>

            <Link href="https://wa.me/1234567890" target="_blank">
              <FaWhatsapp className="text-[#A11200] w-6 h-6 hover:text-green-600 cursor-pointer" />
            </Link>

            <Link href="https://twitter.com" target="_blank">
              <FaXTwitter className="text-[#A11200] w-6 h-6 hover:text-black cursor-pointer" />
            </Link>

          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT */}
      <div className="max-w-7xl mx-auto text-center pt-12 mt-12 border-t border-[#E3DBCE]">
        <p className="text-xs text-[#7F7F7F] tracking-wide">
          Matrimony 2028. All right reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
