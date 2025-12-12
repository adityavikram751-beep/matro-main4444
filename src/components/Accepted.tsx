"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, MessageCircleMore } from "lucide-react"
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
    { name: "rejected", count: null },
];

export default function Accepted() {
    const [activeTab, setActiveTab] = useState("Accepted");

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-2 sm:px-4">
                    <div className="flex gap-6 sm:gap-10 overflow-x-auto items-center justify-evenly py-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`py-3 px-2 text-sm font-medium border-b-2 whitespace-nowrap 
                                    ${activeTab === tab.name
                                        ? "border-red-500 text-red-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700"}
                                `}
                            >
                                {tab.name}
                                {tab.count && ` (${tab.count})`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Button Filters */}
            <div className="flex flex-wrap gap-3 items-center justify-center mt-6 px-4">
                <Button className="border-2 border-[#8E2E37] rounded-full text-black hover:text-white bg-white 
                    hover:bg-[#8E2E37] px-6 py-3 text-sm sm:text-base">
                    Accepted by her
                </Button>

                <Button className="border-2 border-[#8E2E37] rounded-full text-black hover:text-white bg-white 
                    hover:bg-[#8E2E37] px-6 py-3 text-sm sm:text-base">
                    Accepted by Me
                </Button>
            </div>

            {/* Profile Cards */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 space-y-4">
                {profiles.map((profile) => (
                    <Card
                        key={profile.id}
                        className="p-4 sm:p-6 bg-white rounded-lg border border-[#7D0A0A]"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 gap-4">
                            
                            {/* Profile Image */}
                            <div className="flex-shrink-0 mx-auto sm:mx-0">
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

                            {/* Profile Details */}
                            <div className="flex-1 min-w-0">
                                <div className="border-b border-[#757575] pb-2 mb-2">
                                    <h3 className="text-lg font-semibold font-Lato text-[#1E1E1E]">
                                        {profile.name}
                                    </h3>
                                    <p className="text-sm text-[#7A7A7A]">
                                        {profile.profileId} | {profile.lastSeen}
                                    </p>
                                </div>

                                <div className="space-y-1 text-sm text-[#1E1E1E]">
                                    <p>{profile.age} Yrs • {profile.height} • {profile.caste}</p>
                                    <p>{profile.profession} • {profile.salary}</p>
                                    <p>{profile.education}</p>
                                    <p>{profile.location}</p>
                                    <p>{profile.languages.join(", ")}</p>
                                </div>
                            </div>

                            {/* Action Buttons (Responsive) */}
                            <div className="flex sm:flex-col gap-3 pt-3 sm:pt-0 sm:border-l border-[#757575] sm:pl-4 
                                justify-between sm:justify-start w-full sm:w-[220px]">
                                
                                {/* Call */}
                                <div className="group flex justify-center sm:justify-start gap-3 items-center 
                                    border-2 border-[#8E2E37] rounded-full px-6 py-2 hover:bg-[#8E2E37] transition">
                                    <span className="text-black group-hover:text-white font-Lato">Call</span>
                                </div>

                                {/* Chat */}
                                <div className="group flex justify-center sm:justify-start gap-3 items-center 
                                    border-2 border-[#8E2E37] rounded-full px-6 py-2 hover:bg-[#8E2E37] transition">
                                    <span className="text-black group-hover:text-white font-Lato">Chat</span>
                                    <MessageCircleMore className="text-black group-hover:text-white" />
                                </div>

                                {/* Decline */}
                                <div className="group flex justify-center sm:justify-start gap-3 items-center 
                                    border-2 border-[#8E2E37] rounded-full px-6 py-2 hover:bg-[#8E2E37] transition">
                                    <span className="text-black group-hover:text-white font-Lato">Decline</span>
                                    <X className="text-black group-hover:text-white" />
                                </div>
                            </div>

                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
