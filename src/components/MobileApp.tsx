'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';   // ✅ Correct Badge import
import Image from 'next/image';
import { Heart, Star, Apple, Play, MessageCircle } from 'lucide-react';
// import Footer from '@/components/Footer'; // Footer component

export default function MobileApp() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-16 lg:py-24 bg-gradient-to-br from-pink-100 via-red-50 to-orange-100 relative overflow-hidden">

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-20"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-red-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 bg-pink-300 rounded-full opacity-20"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-orange-300 rounded-full opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT CONTENT */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 px-4 py-2 text-sm font-medium">
                  DOWNLOAD OUR APP
                </Badge>

                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Your Journey to Marriage, Now in Your Pocket
                </h2>

                <p className="text-lg text-gray-600 leading-relaxed">
                  Love, trust, and meaningful connections — all within reach. 
                  Download our app and take the first step towards finding your 
                  perfect life partner, anywhere.
                </p>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg flex items-center space-x-3">
                  <Apple className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </Button>

                <Button className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg flex items-center space-x-3">
                  <Play className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </Button>
              </div>

              {/* Ratings */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>50k+ Downloads</span>
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 Rating</span>
                </span>
              </div>
            </div>

            {/* RIGHT - PHONE MOCKUP */}
            <div className="relative flex justify-center">
              <div className="relative">

                {/* Phone UI */}
                <div className="w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">

                    {/* Status Bar */}
                    <div className="bg-red-600 h-12 flex items-center justify-center">
                      <div className="text-white text-sm font-medium">
                        Pure Hearts
                      </div>
                    </div>

                    <Image 
                      className="w-full h-full object-cover"
                      src="/Images/MobileImage.png"
                      alt="App Screenshot"
                      width={320}
                      height={600}
                      priority
                    />
                  </div>
                </div>

                {/* Floating Heart */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>

                {/* Floating Chat Icon */}
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-pink-400 rounded-full flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
}
