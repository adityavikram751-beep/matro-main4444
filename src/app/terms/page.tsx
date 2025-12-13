// import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <>
      {/* ---------------- HEADER ---------------- */}
      <div className="bg-[#FCEEEE] py-14 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-start gap-4">

            {/* ICON (same style but cleaner) */}
            <FileText className="text-[#8B0000] w-8 h-8" />

            <div>
              {/* MAIN TITLE */}
              <h1 className="text-3xl font-semibold text-[#2A2A2A]">
                Terms & Conditions
              </h1>

              {/* SUB-TEXT */}
              <p className="text-gray-700 mt-1 text-[15px]">
                Please read these Terms & Conditions carefully.
              </p>

              {/* LAST UPDATED */}
              <p className="text-gray-500 text-sm mt-4">
                Last Updated : <span className="font-medium">09 December, 2025</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- CONTENT SECTION ---------------- */}
      <div className="max-w-6xl mx-auto py-12 px-6">

        <ol className="list-decimal pl-6 space-y-6 text-[15px] leading-7 text-[#333]">

          <li>
            Welcome to Shaadi.com, your personal matchmaking platform. This Agreement sets out the legally binding terms for your use of the Site and membership. This Agreement may be modified by Shaadi.com from time to time. The membership and rights of admissions are reserved.
          </li>

          <li>
            Shaadi.com is an advertising platform providing targeted advertising services for matchmaking alliances and replaces the traditional newspaper classified. The Site is for the personal use of individual members to advertise and promote their profiles for the purpose of finding relevant matches and cannot be used in connection with any commercial endeavors.
          </li>

          <li>
            The Site is a serious matchmaking platform to seek a life partner for marriage and is not a casual dating site.
          </li>

          <li>
            Access to the Shaadi.com website is free. However, we offer Premium Memberships wherein one can promote his/her Profile on various Shaadi.com properties such as Premium Interest Wall, Inbox, Search Results, Emails, Shaadi Chat, SMS, Video Chat etc.
          </li>

          <li>
            Shaadi.com to assist Mumbai Police / Statutory Investigation Agency.
          </li>

          <li>
            Shaadi.com will endeavour to provide all possible assistance to the Mumbai Police (Cyber Crime Investigation Cell) or any other statutory investigation agency to tackle fraudulent users of Shaadi.com, on being specifically instructed by the said authorities to do so. To report fraud or misuse, write to us giving full details of your case.
          </li>

          <li>
            Acceptance of Terms of Use Agreement.
          </li>

          <li>
            In order to use the Shaadi.com Service you must register as a member. This Agreement is an electronic contract establishing the legally binding terms you must accept to use the Site and to become a “Member”. A “Member” refers to someone who voluntarily submits information to the Site, either as a free user or paid user.
          </li>

          <li>
            By using the Site, you agree to be bound by these Terms of Use (“Agreement”). If you wish to become a Member and promote / advertise your profile to other Members and make use of the Shaadi.com service (“Service”), read the Terms of Use and follow the instructions in the registration process.
          </li>

          <li>
            By using the Service, you consent to submit personally identifiable information including sensitive personal data (if provided voluntarily). This information may be verified through authorized third-party tools to protect the interests of platform members. If you object to this, we advise you not to register.
          </li>

        </ol>
      </div>

      {/* ---------------- FOOTER ---------------- */}
      {/* <Footer /> */}
    </>
  );
}
