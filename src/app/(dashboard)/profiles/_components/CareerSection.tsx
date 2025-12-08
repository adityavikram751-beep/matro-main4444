"use client";
import React, { useState, useEffect, useRef } from "react";
import { Edit3 } from "lucide-react";
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
    setEditValues((prev) => prev.map((it, idx) => (idx === i ? { ...it, value } : it)));
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

      setInfo(editValues); // instantly update UI
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
      <div className="bg-[#FFF8F0] p-6 rounded-2xl text-gray-600 shadow-sm">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="bg-[#FFF8F0] p-6 rounded-2xl text-red-600 shadow-sm">
        {error}
      </div>
    );

  // ------------------------- MAIN UI -------------------------
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
        <h3 className="text-lg font-semibold text-gray-900">Career</h3>
        <Edit3
          className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={() => {
            setEditValues(info);
            setModalOpen(true);
          }}
        />
      </div>

      <div className="space-y-3">
        {info.map((item, i) => (
          <div className="flex text-sm text-gray-700" key={i}>
            <div className="w-1/2 text-gray-600">{item.label}:</div>
            <div className="w-1/2 font-medium">{item.value || "Not specified"}</div>
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
                  className="w-full rounded-md border border-gray-300 p-2 text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
                  value={item.value}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              className="bg-gray-100 text-gray-700"
              onClick={() => setModalOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button className="bg-rose-700 hover:bg-rose-800 text-white" type="submit">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CareerSection;
