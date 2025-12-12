"use client";
import React, { useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type AstroDetailItem = { label: string; value: string };
interface AstroDetailsSectionProps {
  astroDetails?: AstroDetailItem[];
}

const API_URL = "https://matrimonial-backend-7ahc.onrender.com/api/profile/self";
const UPDATE_API_URL = "https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile";

/** small local token helper */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

const defaultItems = (): AstroDetailItem[] => [
  { label: "Zodiac", value: "" },
  { label: "Date of Birth", value: "" },
  { label: "Time of Birth", value: "" },
  { label: "City of Birth", value: "" },
  { label: "Manglik", value: "" },
];

// ===============================================
// CUSTOM EDIT ICON
// ===============================================
const EditIconRounded = (props: any) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6B7280"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="cursor-pointer hover:stroke-gray-700 transition"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
    <path d="M12 8L8 12L7 16L11 15L15 11" />
    <path d="M14 6L18 10" />
  </svg>
);

const AstroDetailsSection: React.FC<AstroDetailsSectionProps> = ({ astroDetails }) => {
  const [info, setInfo] = useState<AstroDetailItem[]>(astroDetails ?? defaultItems());
  const [editValues, setEditValues] = useState<AstroDetailItem[]>(astroDetails ?? defaultItems());
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const savingRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        if (!token) throw new Error("No authentication token found. Please log in.");

        const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        const ad = data?.data?.astroDetails ?? data?.astroDetails ?? {};

        const mapped: AstroDetailItem[] = [
          { label: "Zodiac", value: ad.zodiacSign ?? "" },
          { label: "Date of Birth", value: ad.dateOfBirth ?? "" },
          { label: "Time of Birth", value: ad.timeOfBirth ?? "" },
          { label: "City of Birth", value: ad.cityOfBirth ?? "" },
          { label: "Manglik", value: ad.manglik ?? "" },
        ];

        if (!mountedRef.current) return;
        setInfo(mapped);
        setEditValues(mapped);
      } catch (err: any) {
        if (!mountedRef.current) return;
        setError(err.message || "Failed to fetch astro details");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const openEditor = () => {
    setEditValues(info);
    setUpdateStatus(null);
    setModalOpen(true);
  };

  const handleInputChange = (index: number, value: string) => {
    setEditValues((prev) => {
      const next = prev.map((it, i) => (i === index ? { ...it, value } : it));
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => autoSaveAstro(next), 900);
      return next;
    });
  };

  const autoSaveAstro = async (values: AstroDetailItem[]) => {
    try {
      const token = getToken();
      if (!token) return;

      const body = {
        astroDetails: {
          zodiacSign: values.find((v) => v.label === "Zodiac")?.value ?? "",
          dateOfBirth: values.find((v) => v.label === "Date of Birth")?.value ?? "",
          timeOfBirth: values.find((v) => v.label === "Time of Birth")?.value ?? "",
          cityOfBirth: values.find((v) => v.label === "City of Birth")?.value ?? "",
          manglik: values.find((v) => v.label === "Manglik")?.value ?? "",
        },
      };

      const res = await fetch(UPDATE_API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) return;

      setInfo(values);
      setUpdateStatus("Changes auto-saved");
      setTimeout(() => setUpdateStatus(null), 1400);
    } catch {}
  };

  const handleSave = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setUpdateStatus(null);

    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token found. Please log in.");

      const body = {
        astroDetails: {
          zodiacSign: editValues.find((v) => v.label === "Zodiac")?.value ?? "",
          dateOfBirth: editValues.find((v) => v.label === "Date of Birth")?.value ?? "",
          timeOfBirth: editValues.find((v) => v.label === "Time of Birth")?.value ?? "",
          cityOfBirth: editValues.find((v) => v.label === "City of Birth")?.value ?? "",
          manglik: editValues.find((v) => v.label === "Manglik")?.value ?? "",
        },
      };

      const res = await fetch(UPDATE_API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Save failed");

      setInfo(editValues);
      setModalOpen(false);
      setUpdateStatus("Astro details saved successfully!");
      setTimeout(() => setUpdateStatus(null), 2000);
    } catch (err: any) {
      setUpdateStatus(err.message || "Save failed");
    } finally {
      savingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FFF8F0] rounded-2xl p-6 shadow-sm text-gray-600 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFF8F0] rounded-2xl p-6 shadow-sm text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F0] rounded-2xl p-4 sm:p-6 shadow-sm">

      {updateStatus && (
        <div
          className={`mb-4 p-2 rounded text-center text-sm ${
            updateStatus.toLowerCase().includes("saved")
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {updateStatus}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-semibold text-gray-900">Astro Details</h3>

        <div onClick={openEditor} className="self-end sm:self-auto">
          <EditIconRounded />
        </div>
      </div>

      {/* DETAILS LIST — responsive */}
      <div className="space-y-2">
        {info.map((item, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row text-sm text-gray-700 sm:items-center"
          >
            <div className="sm:w-1/2 w-full flex text-gray-600">
              <span>{item.label}</span>
              <span className="ml-1">:</span>
            </div>

            <div className="sm:w-1/2 w-full font-medium">
              {item.value || "Not specified"}
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="mb-4">
          <h2 className="text-xl font-Lato text-gray-900">Edit Astro Details</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="mb-4 w-full space-y-3">
            {editValues.map((item, i) => (
              <div key={i} className="w-full">
                <Label className="text-sm font-Inter text-gray-700 mb-1 block">
                  {item.label}
                </Label>

                <input
                  className="w-full rounded-md border border-gray-300 p-2 font-Inter bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
                  value={item.value ?? ""}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Buttons responsive */}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-100 text-gray-700 hover:bg-gray-200 w-full sm:w-auto"
              onClick={() => {
                setEditValues(info);
                setModalOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-rose-700 hover:bg-rose-800 text-white w-full sm:w-auto"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AstroDetailsSection;
