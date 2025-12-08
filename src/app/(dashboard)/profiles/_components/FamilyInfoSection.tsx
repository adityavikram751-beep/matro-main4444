"use client";
import React, { useState, useEffect, useRef } from "react";
import { Edit3 } from "lucide-react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type FamilyInfoItem = { label: string; value: string };

interface FamilyInfoSectionProps {
  familyInfo?: FamilyInfoItem[];
}

const API_URL = "https://matrimonial-backend-7ahc.onrender.com/api/profile/self";
const UPDATE_API_URL =
  "https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

const defaultFamilyInfo = (): FamilyInfoItem[] => [
  { label: "Family Background", value: "" },
  { label: "Father is", value: "" },
  { label: "Mother is", value: "" },
  { label: "Brother", value: "" },
  { label: "Sister", value: "" },
  { label: "Family Based Out of", value: "" },
];

const FamilyInfoSection: React.FC<FamilyInfoSectionProps> = ({
  familyInfo = defaultFamilyInfo(),
}) => {
  const [info, setInfo] = useState<FamilyInfoItem[]>(familyInfo);
  const [editValues, setEditValues] = useState<FamilyInfoItem[]>(familyInfo);
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
      if (!token) throw new Error("Please log in first.");

      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load family info");

      const data = await res.json();
      const f = data?.data?.familyDetails ?? {};

      const mapped: FamilyInfoItem[] = [
        { label: "Family Background", value: f.familyBackground || "" },
        { label: "Father is", value: f.fatherOccupation || "" },
        { label: "Mother is", value: f.motherOccupation || "" },
        { label: "Brother", value: f.brother?.toString() || "" },
        { label: "Sister", value: f.sister?.toString() || "" },
        { label: "Family Based Out of", value: f.familyBasedOutOf || "" },
      ];

      setInfo(mapped);
      setEditValues(mapped);
    } catch (err: any) {
      setError(err.message || "Failed to load family info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -------------------- EDIT --------------------
  const handleEdit = () => {
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
        familyDetails: {
          familyBackground:
            editValues.find((i) => i.label === "Family Background")?.value || "",
          fatherOccupation:
            editValues.find((i) => i.label === "Father is")?.value || "",
          motherOccupation:
            editValues.find((i) => i.label === "Mother is")?.value || "",
          brother: parseInt(
            editValues.find((i) => i.label === "Brother")?.value || "0",
            10
          ),
          sister: parseInt(
            editValues.find((i) => i.label === "Sister")?.value || "0",
            10
          ),
          familyBasedOutOf:
            editValues.find((i) => i.label === "Family Based Out of")?.value ||
            "",
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

      if (!res.ok) throw new Error("Failed to save family info");

      setInfo(editValues);
      setModalOpen(false);
      setUpdateStatus("Family info updated successfully!");
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

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Family</h3>
        <Edit3
          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={handleEdit}
        />
      </div>

      {/* TWO-COLUMN VIEW */}
      <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-300">
        <div className="space-y-3 pr-6">
          {info.slice(0, Math.ceil(info.length / 2)).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600 w-1/2">{item.label}</span>
              <span className="text-gray-900 font-medium w-1/2">
                : {item.value || "Not specified"}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-3 pl-6">
          {info.slice(Math.ceil(info.length / 2)).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600 w-1/2">{item.label}</span>
              <span className="text-gray-900 font-medium w-1/2">
                : {item.value || "Not specified"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl font-Lato text-gray-900 mb-4 text-center">
          Edit Family Info
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
            <Button
              className="bg-rose-700 hover:bg-rose-800 text-white"
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

export default FamilyInfoSection;
