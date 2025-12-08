"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {  X,ClockFading } from "lucide-react"
// import { PiPhoneCallThin } from "react-icons/pi";
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
                    <div className="flex gap-10 overflow-x-auto items-center justify-evenly">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`py-4 px-2 whitespace-nowrap text-sm font-medium border-b-2 transition-colors font-Lato  ${activeTab === tab.name
                                    ? "border-red-500 text-red-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab.name}
                                {tab.count && `(${tab.count})`}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {/* Profile Cards */}
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {profiles.map((profile) => (
                    <Card key={profile.id} className="p-6 bg-white rounded-lg border border-[#7D0A0A]">
                        <div className="flex items-start space-x-6">
                            {/* Profile Image */}
                            <div className="flex-shrink-0">
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
                                <div className="flex items-start justify-between">
                                    <div className="border-b border-[#757575] w-full font-Lato">
                                        <h3 className="text-lg font-semibold font-Lato text-[#1E1E1E] mb-1">{profile.name}</h3>
                                        <p className="text-sm text-[#7A7A7A] mb-3">
                                            {profile.profileId} | {profile.lastSeen}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm mt-2 text-regular">
                                    <p className="text-[#1E1E1E]">
                                        <span className="font-Lato">{profile.age} Yrs</span> . {profile.height.replace(/"/g, '&quot;')} . {profile.caste}
                                    </p>
                                    <p className="text-[#1E1E1E]">
                                        {profile.profession} . {profile.salary}
                                    </p>
                                    <p className="text-[#1E1E1E]">{profile.education}</p>
                                    <p className="text-[#1E1E1E]">{profile.location}</p>
                                    <p className="text-[#1E1E1E]">{profile.languages.join(",")}</p>
                                </div>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-3 items-center  border-l border-[#757575] w-[268px]  ">
                                <div className="group flex gap-3 items-center border-2 border-[#8E2E37] rounded-full px-6  transition-colors hover:bg-[#8E2E37]">
                                    <span className="text-black group-hover:text-white font-Lato">Call</span>
                                    <Button
                                        size="icon"
                                        className="bg-transparent border-none p-0 hover:bg-transparent"
                                    >
                                        {/* <PhoneCall className="text-black group-hover:text-white border border-amber-400" /> */}
                                    </Button>
                                </div>
                                {/* Pending Button */}
                                <div className="group flex gap-3 items-center border-2 border-[#8E2E37] rounded-full px-5 transition-colors hover:bg-[#8E2E37]">
                                    <span className="text-black group-hover:text-white font-Lato">Pending</span>
                                    <Button
                                        className="bg-transparent border-none p-0 hover:bg-transparent group-hover:text-white"
                                    >
                                        <ClockFading className="text-black group-hover:text-white "  />
                                        
                                    </Button>
                                </div>
                                {/* Decline Button */}
                                <div className="group flex items-center border-2 border-[#8E2E37] rounded-full px-6  transition-colors hover:bg-[#8E2E37]">
                                    <span className="text-black group-hover:text-white font-Lato">Decline</span>
                                    <Button
                                        size="icon"
                                        className="bg-transparent border-none p-0 hover:bg-transparent"
                                    >
                                        <X className="text-black group-hover:text-white " />
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