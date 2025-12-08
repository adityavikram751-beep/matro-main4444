"use client";
import React, { useState, useEffect, useRef } from "react";
import { Edit3 } from "lucide-react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type EducationItem = { label: string; value: string };

interface EducationSectionProps {
  education?: EducationItem[];
}

const API_URL = "https://matrimonial-backend-7ahc.onrender.com/api/profile/self";
const UPDATE_API_URL =
  "https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

const defaultEducation = (): EducationItem[] => [
  { label: "Highest Degree", value: "" },
  { label: "Post Graduation", value: "" },
  { label: "Under Graduation", value: "" },
  { label: "School", value: "" },
  { label: "School Stream", value: "" },
];

const EducationSection: React.FC<EducationSectionProps> = ({ education = defaultEducation() }) => {
  const [info, setInfo] = useState<EducationItem[]>(education);
  const [editValues, setEditValues] = useState<EducationItem[]>(education);
  const [modalOpen, setModalOpen] = useState(false);

  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const saveLock = useRef(false);

  // -------------------- FETCH --------------------
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) throw new Error("Please log in to continue.");

      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load education details");

      const data = await res.json();
      const e = data?.data?.educationDetails ?? {};

      const mapped: EducationItem[] = [
        { label: "Highest Degree", value: e.highestDegree || "" },
        { label: "Post Graduation", value: e.postGraduation || "" },
        { label: "Under Graduation", value: e.underGraduation || "" },
        { label: "School", value: e.school || "" },
        { label: "School Stream", value: e.schoolStream || "" },
      ];

      setInfo(mapped);
      setEditValues(mapped);
    } catch (err: any) {
      setError(err.message || "Error loading education details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -------------------- EDIT --------------------
  const openEdit = () => {
    setEditValues(info);
    setModalOpen(true);
    setUpdateStatus(null);
  };

  const handleInputChange = (i: number, value: string) => {
    setEditValues((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, value } : it))
    );
  };

  // -------------------- SAVE --------------------
  const handleSave = async () => {
    if (saveLock.current) return;
    saveLock.current = true;
    setUpdateStatus(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not authenticated.");

      const body = {
        educationDetails: {
          highestDegree:
            editValues.find((i) => i.label === "Highest Degree")?.value || "",
          postGraduation:
            editValues.find((i) => i.label === "Post Graduation")?.value || "",
          underGraduation:
            editValues.find((i) => i.label === "Under Graduation")?.value || "",
          school: editValues.find((i) => i.label === "School")?.value || "",
          schoolStream:
            editValues.find((i) => i.label === "School Stream")?.value || "",
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

      if (!res.ok) throw new Error("Failed to save education details");

      setInfo(editValues);
      setModalOpen(false);
      setUpdateStatus("Education details updated successfully!");
    } catch (err: any) {
      setUpdateStatus(err.message || "Update failed");
    } finally {
      saveLock.current = false;
    }
  };

  // -------------------- UI STATES --------------------
  if (loading)
    return (
      <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-sm text-gray-600">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-sm text-red-600">
        {error}
      </div>
    );

  // -------------------- MAIN UI --------------------
  return (
    <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-sm">
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

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
        <Edit3
          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={openEdit}
        />
      </div>

      <div className="space-y-3">
        {info.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-gray-700">
            <span className="w-1/2 text-gray-600">{item.label}:</span>
            <span className="w-1/2 font-medium">
              {item.value || "Not specified"}
            </span>
          </div>
        ))}
      </div>

      {/* ---------------------- MODAL ---------------------- */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl font-Lato text-gray-900 mb-4 text-center">
          Edit Education
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-3 mb-4">
            {editValues.map((item, i) => (
              <div key={i}>
                <Label className="text-sm text-gray-700 mb-1 block">
                  {item.label}
                </Label>
                <input
                  className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:ring-2 focus:ring-rose-700"
                  value={item.value}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-gray-100 text-gray-700"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" className="bg-rose-700 text-white hover:bg-rose-800">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EducationSection;
