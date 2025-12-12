"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, ClockFading } from "lucide-react"
import Image from "next/image"

interface Profile {
  id: string
  name: string
  profileId: string
  lastSeen: string
  age: number
  height: string
  caste: string
  profession: string
  salary: string
  education: string
  location: string
  languages: string[]
  image: string
}

export const profiles: Profile[] = [
  {
    id: "1",
    name: "Aaradhya Sharma",
    profileId: "P9876668",
    lastSeen: "Last seen an hour ago",
    age: 28,
    height: "5'5\"",
    caste: "Brahmin",
    profession: "Software Developer",
    salary: "Earns $5-7 Lakh",
    education: "B.Tech in computer science",
    location: "Delhi",
    languages: ["Hindi", "English"],
    image: "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    id: "2",
    name: "Aaradhya Sharma",
    profileId: "P9876668",
    lastSeen: "Last seen an hour ago",
    age: 28,
    height: "5'5\"",
    caste: "Brahmin",
    profession: "Software Developer",
    salary: "Earns $5-7 Lakh",
    education: "B.Tech in computer science",
    location: "Delhi",
    languages: ["Hindi", "English"],
    image: "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];

const tabs = [
  { name: "Received", count: 32 },
  { name: "Accepted", count: null },
  { name: "Sent", count: null },
  { name: "Rejected", count: null },
];

export default function Sent() {
  const [activeTab, setActiveTab] = useState("Sent");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto items-center justify-evenly py-3">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`py-3 px-2 whitespace-nowrap text-sm font-medium border-b-2 transition-colors font-Lato ${
                  activeTab === tab.name
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.name}
                {tab.count && ` (${tab.count})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className="p-4 sm:p-6 bg-white rounded-lg border border-[#7D0A0A]"
          >
            {/* FULL Responsive Wrapper */}
            <div className="flex flex-col lg:flex-row items-start gap-4 lg:gap-6">

              {/* Profile Image */}
              <div className="flex-shrink-0 self-center lg:self-start">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border border-gray-300 mx-auto lg:mx-0">
                  <Image
                    src={profile.image || "/placeholder.svg"}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Details */}
              <div className="flex-1 min-w-0">
                <div className="border-b border-[#757575] w-full font-Lato pb-2">
                  <h3 className="text-lg font-semibold text-[#1E1E1E] mb-1">{profile.name}</h3>
                  <p className="text-sm text-[#7A7A7A] mb-2">
                    {profile.profileId} | {profile.lastSeen}
                  </p>
                </div>

                <div className="space-y-1 text-sm mt-3 text-[#1E1E1E]">
                  <p>{profile.age} Yrs · {profile.height} · {profile.caste}</p>
                  <p>{profile.profession} · {profile.salary}</p>
                  <p>{profile.education}</p>
                  <p>{profile.location}</p>
                  <p>{profile.languages.join(", ")}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="
                flex flex-row lg:flex-col 
                gap-3 
                w-full lg:w-[260px] 
                border-t lg:border-t-0 lg:border-l 
                border-[#757575] 
                pt-4 lg:pt-0 lg:pl-6
              ">
                {/* Call */}
                <div className="group flex justify-between items-center border-2 border-[#8E2E37] rounded-full px-5 py-2 hover:bg-[#8E2E37] transition-colors cursor-pointer w-full">
                  <span className="text-black group-hover:text-white font-Lato">Call</span>
                  <Button size="icon" className="bg-transparent p-0 hover:bg-transparent"></Button>
                </div>

                {/* Pending */}
                <div className="group flex justify-between items-center border-2 border-[#8E2E37] rounded-full px-5 py-2 hover:bg-[#8E2E37] transition-colors cursor-pointer w-full">
                  <span className="text-black group-hover:text-white font-Lato">Pending</span>
                  <Button className="bg-transparent p-0 hover:bg-transparent group-hover:text-white">
                    <ClockFading className="text-black group-hover:text-white" />
                  </Button>
                </div>

                {/* Decline */}
                <div className="group flex justify-between items-center border-2 border-[#8E2E37] rounded-full px-5 py-2 hover:bg-[#8E2E37] transition-colors cursor-pointer w-full">
                  <span className="text-black group-hover:text-white font-Lato">Decline</span>
                  <Button size="icon" className="bg-transparent p-0 hover:bg-transparent">
                    <X className="text-black group-hover:text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
