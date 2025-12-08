"use client"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Send, X } from "lucide-react"
import { toast } from "sonner"

interface ShortlistedProfile {
  _id: string
  id: string
  name: string
  age: number
  height: string
  caste: string
  designation: string
  religion: string
  salary: string
  education: string
  location: string
  languages: string
  gender: string
  profileImage: string
  lastSeen: string
  viewedAt: string
}

interface ApiResponse {
  success: boolean
  data: ShortlistedProfile[]
}

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
  shortlistType: "theyShortlisted"
  status: "active" | "shortlisted" | "sent" | "notNow"
}

const API_BASE_URL = "https://matrimonial-backend-7ahc.onrender.com/api/like/theyShortlist"

export default function TheyShortlisted() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<{ [key: string]: boolean }>({})

  const fetchTheyShortlistedProfiles = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token found. Please log in.")

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      const res = await fetch(API_BASE_URL, { method: "GET", headers })
      if (!res.ok) throw new Error("Failed to fetch They Shortlisted profiles")

      const data: ApiResponse = await res.json()
      if (data.success && data.data) {
        setProfiles(
          data.data.map((profile) => ({
            id: profile._id,
            name: profile.name || "Not specified",
            profileId: profile.id,
            lastSeen: profile.lastSeen ? new Date(profile.lastSeen).toLocaleString() : "Recently active",
            age: profile.age || 0,
            height: profile.height || "Not specified",
            caste: profile.caste || "Not specified",
            profession: profile.designation || "Not specified",
            salary: profile.salary || "Not specified",
            education: profile.education || "Not specified",
            location: profile.location || "Not specified",
            languages: profile.languages ? profile.languages.split(",").map(l => l.trim()) : ["Not specified"],
            image:
              profile.profileImage ||
              "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg?auto=compress&cs=tinysrgb&w=400",
            shortlistType: "theyShortlisted",
            status: "shortlisted",
          }))
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTheyShortlistedProfiles()
  }, [])

  const removeProfile = (id: string) => {
    setProfiles(prev => prev.filter(profile => profile.id !== id))
  }

  const handleSendConnection = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token")

      setIsProcessing(prev => ({ ...prev, [id]: true }))

      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/request/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId: id }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to send connection request")

      toast.success("Connection request sent successfully")
      removeProfile(id)
    } catch (error) {
      toast.error("Failed to send connection request")
    } finally {
      setIsProcessing(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleNotNow = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) throw new Error("No authentication token")

      setIsProcessing(prev => ({ ...prev, [id]: true }))

      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/cross/user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userIdToBlock: id }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to skip profile")

      toast.success("Profile skipped")
      removeProfile(id)
    } catch (error) {
      toast.error("Failed to skip profile")
    } finally {
      setIsProcessing(prev => ({ ...prev, [id]: false }))
    }
  }

  if (loading) return <p className="text-center">Loading They Shortlisted profiles...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>
  if (profiles.length === 0)
    return <p className="text-center py-6">No profiles found.</p>

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <Card key={profile.id} className="p-6 bg-white rounded-lg border border-[#7D0A0A] flex justify-between items-center">
          {/* Profile Info */}
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
              <Image src={profile.image} alt={profile.name} width={96} height={96} className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold">{profile.name}</h3>
              <p className="text-sm text-gray-500">{profile.profileId} | {profile.lastSeen}</p>
              <p>{profile.age} Yrs · {profile.height} · {profile.caste}</p>
              <p>{profile.profession} · {profile.salary}</p>
              <p>{profile.education}</p>
              <p>{profile.location}</p>
              <p>{profile.languages.join(", ")}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 items-center min-w-[200px] border-l pl-4">
            {/* Send Connection */}
            <Button
              disabled={isProcessing[profile.id]}
              onClick={() => handleSendConnection(profile.id)}
              className="bg-gradient-to-r from-[#2BFF88] to-[#2BD2FF] text-white rounded-full w-12 h-12 p-0"
            >
              {isProcessing[profile.id] ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>

            {/* Not Now */}
            <Button
              disabled={isProcessing[profile.id]}
              onClick={() => handleNotNow(profile.id)}
              className="bg-gray-200 text-gray-700 rounded-full w-12 h-12 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
