"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Modal from "./Modal";

interface AboutMeSectionProps {
  aboutMe?: string;
}

const API_URL =
  "https://matrimonial-backend-7ahc.onrender.com/api/profile/self";
const UPDATE_API_URL =
  "https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile";

// =========================
// CUSTOM EDIT ICON (your screenshot)
// =========================
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

const AboutMeSection: React.FC<AboutMeSectionProps> = ({ aboutMe }) => {
  const [about, setAbout] = useState(aboutMe || "");
  const [editValue, setEditValue] = useState(aboutMe || "");
  const [modalOpen, setModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  // Fetch About Me
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Authentication missing.");

        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        const value = data?.data?.aboutMe || data?.aboutMe || "";

        setAbout(value);
        setEditValue(value);
      } catch (err: any) {
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, []);

  const openEdit = () => {
    setEditValue(about || "");
    setModalOpen(true);
    setUpdateStatus(null);
  };

  const cancelEdit = () => {
    setEditValue(about || "");
    setModalOpen(false);
  };

  const save = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setUpdateStatus(null);

      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found.");

      const res = await fetch(UPDATE_API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aboutMe: editValue }),
      });

      if (!res.ok) throw new Error("Update failed");

      setAbout(editValue);
      setModalOpen(false);
      setUpdateStatus("Profile updated successfully!");
    } catch (err: any) {
      setUpdateStatus(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // UI RENDER
  // -----------------------------------------

  if (loading) {
    return (
      <div className="bg-[#FFF8F0] rounded-2xl p-6 shadow-sm text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FFF8F0] rounded-2xl p-6 shadow-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[#FFF8F0] rounded-2xl p-6 shadow-sm">
      {updateStatus && (
        <div
          className={`mb-4 p-2 rounded ${
            updateStatus.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {updateStatus}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">About me</h3>

        {/* Custom Icon */}
        <div onClick={openEdit}>
          <EditIconRounded />
        </div>
      </div>

      {/* Text */}
      <p className="text-gray-700 text-sm leading-relaxed">
        {about || "No information provided yet."}
      </p>

      {/* Modal */}
      <Modal open={modalOpen} onClose={cancelEdit}>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit About Me
          </h2>
        </div>

        <div className="mb-4">
          <Label className="text-sm text-gray-700 mb-1 block">
            About Me
          </Label>
          <textarea
            rows={5}
            className="w-full border rounded-md p-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            className="bg-gray-100 hover:bg-gray-200"
            onClick={cancelEdit}
          >
            Cancel
          </Button>
          <Button
            className="bg-rose-700 hover:bg-rose-800 text-white"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AboutMeSection;
