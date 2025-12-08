// src/components/Footer.tsx
import React from "react";
import Link from "next/link";
import { Mail, Phone, LucideProps } from "lucide-react";
import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";

const iconProps: LucideProps = {
  className:
    "text-[#601402] w-6 h-6 hover:text-[#5D0202] transition-colors duration-200",
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F5F0E1] text-[#333] py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-16">
        {/* Column 1: Logo and Brand Info */}
        <div className="flex flex-col items-start space-y-4 col-span-1 lg:col-span-2">
          <h2 className="text-[#5D0202] text-4xl font-bold">.logo</h2>
          <p className="text-sm leading-relaxed">
            Where meaningful connections lead to lifelong bonds.
          </p>65
          <div className="flex flex-col space-y-2">
            <a
              href="mailto:agensi@mail.com"
              className="flex items-center text-sm hover:text-[#5D0202] transition-colors duration-200"
            >
              <Mail className="mr-2 text-[#5D0202] w-5 h-5" /> agensi@mail.com
            </a>
            <a
              href="tel:+1234567890"
              className="flex items-center text-sm hover:text-[#5D0202] transition-colors duration-200"
            >
              <Phone className="mr-2 text-[#5D0202] w-5 h-5" /> +12 3456 7890
            </a>
          </div>
          <div className="flex space-x-4 pt-2">
            <Link href="https://instagram.com" target="_blank">
              <FaInstagram className="text-[#601402] w-6 h-6 hover:text-pink-500 transition-colors duration-200" />
            </Link>
            <Link href="https://facebook.com" target="_blank">
              <FaFacebook className="text-[#601402] w-6 h-6 hover:text-blue-600 transition-colors duration-200" />
            </Link>
            <Link href="https://wa.me/1234567890" target="_blank">
              <FaWhatsapp className="text-[#601402] w-6 h-6 hover:text-green-600 transition-colors duration-200" />
            </Link>
            <Link href="https://twitter.com" target="_blank">
              <FaTwitter className="text-[#601402] w-6 h-6 hover:text-sky-500 transition-colors duration-200" />
            </Link>
          </div>
        </div>

        {/* Column 2: Services */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-semibold text-[#601402]">Services</h3>
          <ul className="text-sm space-y-2">
            <li>
              <Link
                href="/browse-profiles"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Browse Profiles
              </Link>
            </li>
            <li>
              <Link
                href="/membership-plans"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Membership Plans
              </Link>
            </li>
            <li>
              <Link
                href="/register"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Register Free
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                href="/success-stories"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Success Stories
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-semibold text-[#601402]">Support</h3>
          <ul className="text-sm space-y-2">
            <li>
              <Link
                href="/help-faqs"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/safety-tips"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Safety & Security Tips
              </Link>
            </li>
            <li>
              <Link
                href="/report"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Report/Block a Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Company */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-semibold text-[#601402]">Company</h3>
          <ul className="text-sm space-y-2">
            <li>
              <Link
                href="/about"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/join-us"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Join Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 5: Legal */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-xl font-semibold text-[#601402]">Legal</h3>
          <ul className="text-sm space-y-2">
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-conditions"
                className="hover:text-[#5D0202] transition-colors duration-200"
              >
                Terms & Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto text-center pt-8 mt-8 border-t border-[#CCC] ">
        <p className="text-xs text-[#777]">Matrimony 2020. All right reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
