"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {  X, MessageCircleMore } from "lucide-react"
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
  acceptedBy: "me" | "her"
}

const profiles: Profile[] = [
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
    image:
      "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400",
    acceptedBy: "her",
  },
  {
    id: "2",
    name: "Rohit Kumar",
    profileId: "P1234567",
    lastSeen: "Last seen 2 days ago",
    age: 30,
    height: "5'8\"",
    caste: "Kshatriya",
    profession: "Business Analyst",
    salary: "Earns $8-10 Lakh",
    education: "MBA",
    location: "Mumbai",
    languages: ["Hindi", "English", "Marathi"],
    image:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
    acceptedBy: "me",
  },
]

const tabs = [
  { name: "Received", count: 32 },
  { name: "Accepted", count: profiles.length },
  { name: "Sent", count: null },
  { name: "Rejected", count: null },
]

export default function Accepted() {
  const [activeTab, setActiveTab] = useState("Accepted")
  const [activeSubTab, setActiveSubTab] = useState<
    "Accepted by her" | "Accepted by me" | "All"
  >("All")

  // Filter profiles based on activeSubTab and activeTab
  const filteredProfiles = profiles.filter((p) => {
    if (activeTab !== "Accepted") return false
    if (activeSubTab === "All") return true
    if (activeSubTab === "Accepted by her") return p.acceptedBy === "her"
    if (activeSubTab === "Accepted by me") return p.acceptedBy === "me"
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-evenly gap-4 py-4">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`whitespace-nowrap text-sm font-medium border-b-2 transition-colors font-Lato ${
                  activeTab === tab.name
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.name} {tab.count ? `(${tab.count})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub Tabs (only show if 'Accepted' tab active) */}
      {activeTab === "Accepted" && (
        <div className="flex flex-wrap gap-3 items-center justify-center mt-6 px-4">
          {["Accepted by her", "Accepted by me", "All"].map((tab) => (
            <Button
              key={tab}
              className={`border-2 border-[#8E2E37] rounded-full text-black hover:text-white bg-white transition-colors hover:bg-[#8E2E37] px-6 py-3 ${
                activeSubTab === tab ? "bg-[#8E2E37] text-white" : ""
              }`}
              onClick={() => setActiveSubTab(tab as typeof activeSubTab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      )}

      {/* Profiles List */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {filteredProfiles.length === 0 && (
          <p className="text-center text-gray-500">No profiles found.</p>
        )}
        {filteredProfiles.map((profile) => (
          <Card
            key={profile.id}
            className="p-4 sm:p-6 bg-white rounded-lg border border-[#7D0A0A]"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-stretch gap-4 lg:gap-6">
              {/* Image */}
              <div className="flex-shrink-0 self-center lg:self-auto">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                  <Image
                    src={profile.image || "/placeholder.svg"}
                    alt={profile.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="border-b border-[#757575] mb-2 font-Lato">
                  <h3 className="text-lg font-semibold text-[#1E1E1E] mb-1">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-[#7A7A7A] mb-3">
                    {profile.profileId} | {profile.lastSeen}
                  </p>
                </div>
                <div className="space-y-1 text-sm font-Lato text-[#1E1E1E]">
                  <p>
                    <span>{profile.age} Yrs</span> . {profile.height} .{" "}
                    {profile.caste}
                  </p>
                  <p>
                    {profile.profession} . {profile.salary}
                  </p>
                  <p>{profile.education}</p>
                  <p>{profile.location}</p>
                  <p>{profile.languages.join(", ")}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex lg:flex-col gap-2 w-full lg:w-[240px] border-t lg:border-t-0 lg:border-l border-[#757575] pt-4 lg:pt-0 lg:pl-6 justify-between">
                {/* Call */}
                <div className="group flex justify-between items-center border-2 border-[#8E2E37] rounded-full px-4 py-2 hover:bg-[#8E2E37] transition-colors cursor-pointer">
                  <span className="text-sm font-Lato text-black group-hover:text-white">
                    Call
                  </span>
                  <Button
                    size="icon"
                    className="bg-transparent border-none p-0 hover:bg-transparent"
                  >
                    {/* <PhoneCall className="text-black group-hover:text-white" /> */}
                  </Button>
                </div>
                {/* Chat */}
                <div className="group flex justify-between items-center border-2 border-[#8E2E37] rounded-full px-4 py-2 hover:bg-[#8E2E37] transition-colors cursor-pointer">
                  <span className="text-sm font-Lato text-black group-hover:text-white">
                    Chat
                  </span>
                  <Button
                    size="icon"
                    className="bg-transparent border-none p-0 hover:bg-transparent"
                  >
                    <MessageCircleMore className="text-black group-hover:text-white" />
                  </Button>
                </div>
                {/* Decline */}
                <div className="group flex justify-between items-center border-2 border-[#8E2E37] rounded-full px-4 py-2 hover:bg-[#8E2E37] transition-colors cursor-pointer">
                  <span className="text-sm font-Lato text-black group-hover:text-white">
                    Decline
                  </span>
                  <Button
                    size="icon"
                    className="bg-transparent border-none p-0 hover:bg-transparent"
                  >
                    <X className="text-black group-hover:text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
