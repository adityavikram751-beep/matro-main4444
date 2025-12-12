"use client";
import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CareerItem = { label: string; value: string };
interface CareerSectionProps {
  career?: CareerItem[];
}

const API_URL = "https://matrimonial-backend-7ahc.onrender.com/api/profile/self";
const UPDATE_API_URL =
  "https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

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

const CareerSection: React.FC<CareerSectionProps> = ({ career = [] }) => {
  const [info, setInfo] = useState<CareerItem[]>(career);
  const [editValues, setEditValues] = useState<CareerItem[]>(career);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveLock = useRef(false);

  // ----------------------- FETCH DATA -----------------------
  const fetchCareerDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) throw new Error("Please log in first.");

      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load career details");

      const data = await res.json();
      const c = data?.data?.careerDetails ?? {};

      const mapped: CareerItem[] = [
        { label: "Employee In", value: c.employedIn || "" },
        { label: "Occupation", value: c.occupation || "" },
        { label: "Company", value: c.company || "" },
        { label: "Annual Income", value: c.annualIncome || "" },
      ];

      setInfo(mapped);
      setEditValues(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerDetails();
  }, []);

  // ---------------------- INPUT HANDLER ---------------------
  const handleInputChange = (i: number, value: string) => {
    setEditValues((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, value } : it))
    );
  };

  // -------------------------- SAVE --------------------------
  const handleSave = async () => {
    if (saveLock.current) return;
    saveLock.current = true;
    setUpdateStatus(null);

    try {
      const token = getToken();
      if (!token) throw new Error("No authentication token found.");

      const body = {
        careerDetails: {
          employedIn: editValues.find((i) => i.label === "Employee In")?.value || "",
          occupation: editValues.find((i) => i.label === "Occupation")?.value || "",
          company: editValues.find((i) => i.label === "Company")?.value || "",
          annualIncome: editValues.find((i) => i.label === "Annual Income")?.value || "",
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

      if (!res.ok) throw new Error("Error updating career details");

      setInfo(editValues);
      setModalOpen(false);
      setUpdateStatus("Career details updated successfully!");
    } catch (err: any) {
      setUpdateStatus(err.message || "Update failed");
    } finally {
      saveLock.current = false;
    }
  };

  // ------------------------ UI STATES ------------------------
  if (loading)
    return (
      <div className="bg-[#FFF8F0] p-6 rounded-2xl text-gray-600 shadow-sm text-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="bg-[#FFF8F0] p-6 rounded-2xl text-red-600 shadow-sm text-center">
        {error}
      </div>
    );

  // ------------------------- MAIN UI -------------------------
  return (
    <div className="bg-[#FFF8F0] p-4 sm:p-6 rounded-2xl shadow-sm">

      {updateStatus && (
        <div
          className={`mb-4 p-2 rounded text-center ${
            updateStatus.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {updateStatus}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h3 className="text-lg font-semibold text-gray-900">Career</h3>

        <div
          onClick={() => {
            setEditValues(info);
            setModalOpen(true);
          }}
        >
          <EditIconRounded />
        </div>
      </div>

      {/* Responsive Career List */}
      <div className="space-y-3">
        {info.map((item, i) => (
          <div
            className="flex flex-col sm:flex-row text-sm text-gray-700 sm:items-center"
            key={i}
          >
            <div className="sm:w-1/2 w-full text-gray-600">{item.label}:</div>
            <div className="sm:w-1/2 w-full font-medium">
              {item.value || "Not specified"}
            </div>
          </div>
        ))}
      </div>

      {/* --------------------- MODAL --------------------- */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl text-gray-900 font-Lato mb-4 text-center">
          Edit Career
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
                <Label className="mb-1 text-gray-700">{item.label}</Label>
                <input
                  className="
                    w-full rounded-md border border-gray-300 p-2 
                    text-gray-700 bg-white shadow-sm
                    focus:outline-none focus:ring-2 focus:ring-rose-700
                  "
                  value={item.value}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Responsive Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              type="button"
              className="bg-gray-100 text-gray-700 w-full sm:w-auto"
              onClick={() => setModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="bg-rose-700 hover:bg-rose-800 text-white w-full sm:w-auto"
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CareerSection;
