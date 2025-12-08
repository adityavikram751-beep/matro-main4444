import Hero from "../components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import SuccessStories from "@/components/SuccessStories";
import MobileApp from "@/components/MobileApp";
// import HowItWork from "@/components/HowItWork";

export default function Home() {
  return (
  <div>
    
    <Hero />
    {/* <HowItWork /> */}
    <WhyChooseUs />
    <SuccessStories />
    <MobileApp />
    
  </div>
  );
}
