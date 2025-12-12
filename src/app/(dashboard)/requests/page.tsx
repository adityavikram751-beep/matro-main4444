"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  X,
  MessageCircleMore,
  ClockFading,
  Check,
  Trash,
  Phone,
  Send,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loading from "../../../Loading";

/**
 * Final ready-to-paste component
 *
 * NOTE: placeholderImage is the uploaded file path (will be transformed by your toolchain).
 * If you want to use a different placeholder, change placeholderImage.
 */
const placeholderImage = "/mnt/data/28ce5a41-f9c4-482a-85e3-ac1f458668e3.png";

type Status = "received" | "accepted" | "sent" | "rejected" | "deleted" | "pending";

interface RawUser {
  _id?: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  age?: number;
  height?: string;
  caste?: string;
  designation?: string;
  religion?: string;
  salary?: string;
  annualIncome?: string;
  education?: string;
  highestEducation?: string;
  location?: string;
  city?: string;
  state?: string;
  languages?: string[] | string;
  motherTongue?: string;
  profileImage?: string;
  lastSeen?: string;
  [k: string]: any;
}

interface RequestRaw {
  requestId?: string;
  status?: string;
  createdAt?: string;
  acceptedBy?: string;
  user?: RawUser;
  [k: string]: any;
}

interface Profile {
  id: string;
  name: string;
  profileId: string;
  lastSeen: string;
  age: number;
  height: string;
  caste: string;
  profession: string;
  salary: string;
  education: string;
  location: string;
  languages: string[];
  image: string;
  status: Status;
  requestId?: string;
  acceptedBy?: string | null;
}

export default function MatrimonialApp() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"Received" | "Accepted" | "Sent" | "Rejected">("Received");

  const [receivedProfiles, setReceivedProfiles] = useState<Profile[]>([]);
  const [acceptedProfiles, setAcceptedProfiles] = useState<Profile[]>([]);
  const [sentProfiles, setSentProfiles] = useState<Profile[]>([]);
  const [rejectedProfiles, setRejectedProfiles] = useState<Profile[]>([]);
  const [deletedProfiles, setDeletedProfiles] = useState<Profile[]>([]);

  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // API endpoints (as confirmed)
  const apiReceived = "https://matrimonial-backend-7ahc.onrender.com/api/request/received";
  const apiAccepted = "https://matrimonial-backend-7ahc.onrender.com/api/request/receivedData?status=accepted";
  const apiSent = "https://matrimonial-backend-7ahc.onrender.com/api/request/getSendRequest";
  const apiRejected = "https://matrimonial-backend-7ahc.onrender.com/api/request/receivedData?status=rejected";
  const apiUpdateStatus = "https://matrimonial-backend-7ahc.onrender.com/api/request/update-status";

  const safeToken = () => (typeof window !== "undefined" ? localStorage.getItem("authToken") : "");

  function transformToProfile(item: RequestRaw | RawUser | null, fallbackRequestId?: string): Profile | null {
    if (!item) return null;
    const raw: any = (item as any).user ? (item as any).user : item;
    if (!raw) return null;
    const id = raw._id || raw.id || "";
    if (!id) return null;

    const birthDate = raw.dateOfBirth ? new Date(raw.dateOfBirth) : null;
    const age = raw.age || (birthDate ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0);

    let status: Status = "received";
    const maybeStatus = (item as any).status || raw.status;
    if (maybeStatus) {
      const st = String(maybeStatus).toLowerCase();
      if (st.includes("accept")) status = "accepted";
      else if (st.includes("reject")) status = "rejected";
      else if (st.includes("sent")) status = "sent";
      else if (st.includes("deleted")) status = "deleted";
      else if (st.includes("pending")) status = "pending";
      else status = "received";
    }

    const name = raw.name || [raw.firstName, raw.lastName].filter(Boolean).join(" ") || "Unknown";

    const languages =
      Array.isArray(raw.languages) ? raw.languages :
        typeof raw.languages === "string" && raw.languages.length > 0 ? raw.languages.split(",").map((s: string) => s.trim()) :
          raw.motherTongue ? [raw.motherTongue] : ["Not specified"];

    const location = raw.location || (raw.city && raw.state ? `${raw.city}, ${raw.state}` : raw.city || raw.state || "Not specified");

    return {
      id,
      name,
      profileId: raw.id || raw.profileId || "",
      lastSeen: raw.lastSeen || "Last seen recently",
      age: age || 0,
      height: raw.height || "Not specified",
      caste: raw.caste || "Not specified",
      profession: raw.designation || raw.profession || "Not specified",
      salary: raw.salary || raw.annualIncome || "Not specified",
      education: raw.education || raw.highestEducation || "Not specified",
      location,
      languages,
      image: raw.profileImage || placeholderImage,
      status,
      requestId: (item as any).requestId || fallbackRequestId || raw.requestId || undefined,
      acceptedBy: (item as any).acceptedBy || null,
    } as Profile;
  }

  /* -------------------- Fetchers -------------------- */

  async function fetchReceived() {
    setLoading(true);
    try {
      const token = safeToken();
      const res = await fetch(apiReceived, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      const arr: RequestRaw[] = json.requests || json.data || [];
      const mapped = arr.map(i => transformToProfile(i)).filter((p): p is Profile => !!p);
      setReceivedProfiles(mapped);
    } catch (err) {
      console.error("fetchReceived:", err);
      toast.error("Failed to load received");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAccepted() {
    setLoading(true);
    try {
      const token = safeToken();
      const res = await fetch(apiAccepted, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      const arr: RequestRaw[] = json.requests || json.data || [];
      const mapped = arr.map(i => transformToProfile(i)).filter((p): p is Profile => !!p);
      setAcceptedProfiles(mapped);
    } catch (err) {
      console.error("fetchAccepted:", err);
      toast.error("Failed to load accepted");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSent() {
    setLoading(true);
    try {
      const token = safeToken();
      const res = await fetch(apiSent, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      const arr: RequestRaw[] = json.requests || json.data || [];
      const mapped = arr.map(i => transformToProfile(i)).filter((p): p is Profile => !!p);
      setSentProfiles(mapped);
    } catch (err) {
      console.error("fetchSent:", err);
      toast.error("Failed to load sent");
    } finally {
      setLoading(false);
    }
  }

  async function fetchRejected() {
    setLoading(true);
    try {
      const token = safeToken();
      const res = await fetch(apiRejected, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const json = await res.json();
      const arr: RequestRaw[] = json.requests || json.data || [];
      const mapped = arr.map(i => transformToProfile(i)).filter((p): p is Profile => !!p);
      setRejectedProfiles(mapped);
    } catch (err) {
      console.error("fetchRejected:", err);
      toast.error("Failed to load rejected");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = safeToken();
    if (!token) return;
    setLoading(true);
    Promise.all([fetchReceived(), fetchAccepted(), fetchSent(), fetchRejected()])
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  /* -------------------- Actions (Received tab uses update-status) -------------------- */

  async function handleUpdateStatus(profile: Profile, newStatus: "accepted" | "rejected") {
    if (!profile.requestId) {
      toast.error("Request ID missing");
      return;
    }

    try {
      const token = safeToken();
      if (!token) {
        toast.error("No token found");
        return;
      }

      const res = await fetch(apiUpdateStatus, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          requestId: profile.requestId,
          status: newStatus
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        toast.success(newStatus === "accepted" ? "Accepted" : "Rejected");

        // Local sync updates
        setReceivedProfiles(prev => prev.filter(p => p.id !== profile.id));

        if (newStatus === "accepted") {
          setAcceptedProfiles(prev => [
            { ...profile, status: "accepted" },
            ...prev
          ]);
        } else {
          setRejectedProfiles(prev => [
            { ...profile, status: "rejected" },
            ...prev
          ]);
        }
      } else {
        toast.error(json.message || "Failed to update status");
      }

    } catch (err) {
      console.error("update-status error:", err);
      toast.error("Error updating status");
    }
  }


  async function handleSendConnection(profile: Profile) {
    try {
      const token = safeToken();
      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/request/send", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: profile.id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Connection sent");
        // Move locally to sentProfiles or mark status
        setSentProfiles(prev => [{ ...profile, status: "sent" }, ...prev]);
        setReceivedProfiles(prev => prev.filter(p => p.id !== profile.id));
      } else {
        toast.error(json.message || "Failed to send connection");
      }
    } catch (err) {
      console.error("send error", err);
      toast.error("Error sending connection");
    }
  }

  async function handleDelete(profile: Profile) {
    if (!profile.requestId) {
      toast.error("Request ID missing");
      return;
    }
    try {
      const token = safeToken();
      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/request/delete", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: profile.requestId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Deleted");
        setDeletedProfiles(prev => [{ ...profile, status: "deleted" }, ...prev]);
        setSentProfiles(prev => prev.filter(p => p.id !== profile.id));
      } else {
        toast.error(json.message || "Failed to delete");
      }
    } catch (err) {
      console.error("delete error", err);
      toast.error("Error deleting");
    }
  }

  async function handleRestore(profile: Profile) {
    if (!profile.requestId) {
      toast.error("Request ID missing");
      return;
    }
    try {
      const token = safeToken();
      const res = await fetch("https://matrimonial-backend-7ahc.onrender.com/api/request/restore", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: profile.requestId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Restored");
        // move to sent
        setDeletedProfiles(prev => prev.filter(p => p.id !== profile.id));
        setRejectedProfiles(prev => prev.filter(p => p.id !== profile.id));
        setSentProfiles(prev => [{ ...profile, status: "sent", requestId: json.requestId || profile.requestId }, ...sentProfiles]);
      } else {
        toast.error(json.message || "Failed to restore");
      }
    } catch (err) {
      console.error("restore error", err);
      toast.error("Error restoring");
    }
  }

  function handleChat(profile: Profile) {
    if (typeof window === "undefined") return;
    localStorage.setItem("chatUser", JSON.stringify(profile));
    const baseUrl = window.location.origin;
    router.push(`${baseUrl}/messages?userId=${profile.id}&name=${encodeURIComponent(profile.name)}`);
  }

  /* -------------------- UI helpers -------------------- */

  const tabs = [
    { name: "Received", count: receivedProfiles.filter(p => p.status === "received" || p.status === "pending").length },
    { name: "Accepted", count: acceptedProfiles.length },
    { name: "Sent", count: sentProfiles.length },
    { name: "Rejected", count: rejectedProfiles.length },
  ];

  const currentList = useMemo(() => {
    if (activeTab === "Received") return receivedProfiles.filter(p => p.status === "received" || p.status === "pending");
    if (activeTab === "Accepted") return acceptedProfiles;
    if (activeTab === "Sent") return sentProfiles;
    if (activeTab === "Rejected") return rejectedProfiles;
    return [];
  }, [activeTab, receivedProfiles, acceptedProfiles, sentProfiles, rejectedProfiles]);

  /* -------------------- PROFILE CARD (RESPONSIVE) -------------------- */

  function ProfileCard({ profile }: { profile: Profile }) {
    return (
      <Card className="p-4 sm:p-6 bg-white rounded-lg border border-[#7D0A0A] w-full">

        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">

          {/* IMAGE */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
              <a href={`./requests/${profile.id}`}>
                <Image
                  src={profile.image || placeholderImage}
                  alt={profile.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </a>
            </div>
          </div>

          {/* MIDDLE CONTENT */}
          <div className="flex-1 min-w-0">

            <div className="flex items-start justify-between">
              <div className="border-b border-[#757575] w-full pb-1">
                <h3 className="text-lg font-semibold font-Lato text-[#1E1E1E] mb-1 break-words">
                  {profile.name}
                </h3>
                <p className="text-sm text-[#7A7A7A] mb-2 break-words">
                  {profile.profileId} | {profile.lastSeen}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm mt-2 text-regular break-words">
              <p className="text-[#1E1E1E]">
                <span className="font-Lato">{profile.age} Yrs</span> · {profile.height} · {profile.caste}
              </p>
              <p className="text-[#1E1E1E]">{profile.profession} · {profile.salary}</p>
              <p className="text-[#1E1E1E]">{profile.education}</p>
              <p className="text-[#1E1E1E]">{profile.location}</p>
              <p className="text-[#1E1E1E]">{profile.languages.join(", ")}</p>
            </div>
          </div>

          {/* ACTIONS RIGHT SIDE — MAKING RESPONSIVE */}
          <div className="
            flex flex-col space-y-3 items-center 
            border-t sm:border-t-0 sm:border-l border-[#757575]
            w-full sm:w-[220px] pt-4 sm:pt-0 sm:px-4
          ">

            {/* RECEIVED TAB */}
            {activeTab === "Received" && (
              <>
                {/* Accept */}
                <div className="flex items-center justify-between w-full sm:justify-start sm:gap-4">
                  <span className="text-sm font-Lato text-[#000000]">Accept</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="group h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-[#4bb65b] bg-transparent hover:bg-[#4bb65b]"
                    onClick={() => handleUpdateStatus(profile, "accepted")}
                  >
                    <Check className="h-5 w-5 text-[#4bb65b] group-hover:text-white" />
                  </Button>
                </div>

                {/* Reject */}
                <div className="flex items-center justify-between w-full sm:justify-start sm:gap-4">
                  <span className="text-sm font-Lato text-[#000000]">Reject</span>
                  <Button
                    variant="outline"
                    className="bg-[#ADADAD] hover:bg-gray-50 rounded-full w-10 h-10 sm:w-12 sm:h-12 p-0"
                    size="sm"
                    onClick={() => handleUpdateStatus(profile, "rejected")}
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </Button>
                </div>
              </>
            )}

            {/* ACCEPTED TAB */}
            {activeTab === "Accepted" && (
              <>
                <div className="group flex items-center border-2 border-[#8E2E37] rounded-full px-4 h-10 w-full justify-center"></div>

                <div className="group flex items-center justify-between sm:justify-center border-2 border-[#8E2E37] rounded-full px-4 h-10 w-full hover:bg-[#8E2E37] transition">
                  <span className="text-black group-hover:text-white font-Lato">Chat</span>
                  <Button
                    size="sm"
                    className="bg-transparent border-none p-0 hover:bg-transparent"
                    onClick={() => handleChat(profile)}
                  >
                    <MessageCircleMore className="w-4 h-4 text-black group-hover:text-white" />
                  </Button>
                </div>

                <div className="group flex items-center justify-between sm:justify-center border-2 border-[#8E2E37] rounded-full px-4 h-10 w-full hover:bg-[#8E2E37] transition">
                  <span className="text-black group-hover:text-white font-Lato">Reject</span>
                  <Button
                    size="sm"
                    className="bg-transparent border-none p-0"
                    onClick={() => handleUpdateStatus(profile, "rejected")}
                  >
                    <X className="w-4 h-4 text-black group-hover:text-white" />
                  </Button>
                </div>
              </>
            )}

            {/* SENT TAB */}
            {activeTab === "Sent" && (
              <>
                <div className="h-10 border-2 border-[#8E2E37] rounded-full w-full"></div>

                <div className="group flex items-center justify-center border-2 border-[#8E2E37] rounded-full px-4 h-10 w-full hover:bg-[#8E2E37] transition">
                  <span className="text-black group-hover:text-white font-Lato">Pending</span>
                  <ClockFading className="w-4 h-4 ml-2 text-black group-hover:text-white" />
                </div>

                <div className="group flex items-center justify-between sm:justify-center border-2 border-[#8E2E37] rounded-full px-4 h-10 w-full hover:bg-[#8E2E37] transition">
                  <span className="text-black group-hover:text-white font-Lato">Delete</span>
                  <Button
                    size="sm"
                    className="bg-transparent border-none p-0"
                    onClick={() => handleDelete(profile)}
                  >
                    <Trash className="w-4 h-4 text-black group-hover:text-white" />
                  </Button>
                </div>
              </>
            )}

            {/* REJECTED TAB */}
            {activeTab === "Rejected" && (
              <div className="flex flex-col items-center space-y-2 w-full">
                <div className="text-gray-600 font-Lato text-sm">Profile Rejected</div>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 py-2"
                  onClick={() => handleRestore(profile)}
                >
                  Restore
                </Button>
              </div>
            )}

            {profile.status === "deleted" &&
              <div className="text-sm text-gray-500 font-Lato">Deleted</div>}
          </div>
        </div>
      </Card>
    );
  }

  /* ---------------------------------------------------------
     🔥 COMPONENT FINAL RETURN (FULLY RESPONSIVE VERSION)
  --------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔥 FIXED TABS NAVBAR — RESPONSIVE UPDATED */}
      <div className="bg-white border-b sticky top-[72px] z-40">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">

          <div className="flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar items-center justify-start sm:justify-evenly py-2">

            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name as any)}
                className={`
                  pb-3 px-2 whitespace-nowrap text-sm font-medium border-b-2 transition-colors font-Lato
                  ${activeTab === tab.name
                    ? "border-red-500 text-red-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                {tab.name}
                {typeof tab.count === "number" ? ` (${tab.count})` : ""}
              </button>
            ))}

          </div>

        </div>
      </div>

      {/* SPACING */}
      <div className="h-2"></div>

      {/* SMALL SPACING CONDITION — KEEP AS IS */}
      {activeTab === "Accepted" && (
        <div className="flex gap-3 items-center justify-center mt-4 sm:mt-8"></div>
      )}

      {/* MAIN LIST CONTAINER */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4">

        {loading ? (
          <Loading message="Loading profiles..." />

        ) : currentList.length === 0 ? (

          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-gray-600 text-lg">No profiles found</div>
          </div>

        ) : (

          currentList.map((p, idx) => (
            <ProfileCard
              key={`${p.id}-${p.requestId || "noReq"}-${idx}`}
              profile={p}
            />
          ))

        )}

      </div>

    </div>
  );
}
