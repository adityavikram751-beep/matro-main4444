import { Users, Target, Eye } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      {/* ---------- HEADER SECTION ---------- */}
      <div className="bg-[#FCEEEE] py-16 px-6 border-b border-red-100">
        <div className="max-w-7xl mx-auto flex items-start gap-4">
          
          {/* ICON */}
          <Users className="text-[#8B0000] w-10 h-10" />

          <div>
            <h1 className="text-3xl font-bold text-[#2A2A2A]">Our Story</h1>

            <p className="text-gray-700 text-[16px] mt-2">
              Get to know more about Us.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- ABOUT CONTENT SECTION ---------- */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

        {/* LEFT TEXT CONTENT */}
        <div className="space-y-6 text-[15px] leading-7 text-[#333]">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore 
            et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut 
            aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum 
            dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui 
            officia deserunt mollit anim id est laborum.
          </p>

          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
            totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta 
            sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia 
            consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, 
            qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi 
            tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. 
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center">
   <img
  src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg"
  alt="About Us"
  className="w-full max-w-md rounded-3xl object-cover shadow-md"
/>



        </div>
      </div>

      {/* ---------- MISSION & VISION SECTION ---------- */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* MISSION CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#8B0000] font-semibold">
            <Target className="w-5 h-5" />
            OUR MISSION
          </div>

          <p className="text-gray-700 text-[15px] leading-6">
            To create a safe, inclusive, and innovative platform that empowers 
            individuals to find their life partners through meaningful connections.  
            We strive to make the journey of finding love accessible, secure, and 
            successful for everyone.
          </p>
        </div>

        {/* VISION CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-[#8B0000] font-semibold">
            <Eye className="w-5 h-5" />
            OUR VISION
          </div>

          <p className="text-gray-700 text-[15px] leading-6">
            To become the world's most trusted and successful matrimonial 
            platform, where every member finds their perfect match.  
            We envision a future where technology and human connection 
            work together to create lasting, happy marriages.
          </p>
        </div>
      </div>

      {/* ---------- FOOTER ---------- */}
      {/* <Footer /> */}
    </>
  );
}
