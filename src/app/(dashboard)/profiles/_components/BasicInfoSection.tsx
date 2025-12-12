"use client";
import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type BasicInfoItem = { label: string; value: string };

interface BasicInfoSectionProps {
  basicInfo?: BasicInfoItem[];
  onChange?: (updatedBasicInfo: BasicInfoItem[]) => void;
}

const API_URL = "https://matrimonial-backend-7ahc.onrender.com/api/profile/self";
const UPDATE_API_URL =
  "https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile";

// helper
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

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

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  basicInfo = [],
  onChange,
}) => {
  const [info, setInfo] = useState<BasicInfoItem[]>(basicInfo);
  const [editValues, setEditValues] = useState<BasicInfoItem[]>(basicInfo);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveLock = useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) throw new Error("Please log in first.");

        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load basic info");

        const data = await res.json();
        const b = data?.data?.basicInfo ?? {};

        const mapped: BasicInfoItem[] = [
          { label: "Posted by", value: b.postedBy || "Self" },
          {
            label: "Name",
            value: `${b.firstName || ""} ${
              b.middleName !== "None" ? b.middleName || "" : ""
            } ${b.lastName || ""}`
              .replace(/\s+/g, " ")
              .trim(),
          },
          { label: "Age", value: b.age?.toString() || "" },
          { label: "Marital Status", value: b.maritalStatus || "" },
          { label: "Height", value: b.height || "" },
          { label: "Any Disability", value: b.anyDisability || "None" },
          {
            label: "Health Information",
            value: b.healthInformation || "Not Specified",
          },
          { label: "Weight", value: b.weight?.toString() || "" },
          { label: "Complexion", value: b.complexion || "" },
        ];

        setInfo(mapped);
        setEditValues(mapped);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const openEditor = () => {
    setEditValues(info);
    setModalOpen(true);
    setUpdateStatus(null);
  };

  const handleInputChange = (index: number, value: string) => {
    setEditValues((prev) =>
      prev.map((it, i) => (i === index ? { ...it, value } : it))
    );
    if (onChange) onChange(editValues);
  };

  const handleSave = async () => {
    if (saveLock.current) return;
    saveLock.current = true;
    setUpdateStatus(null);

    try {
      const token = getToken();
      if (!token) throw new Error("Not logged in");

      const nameField = editValues.find((i) => i.label === "Name")?.value || "";
      const parts = nameField.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.length > 1 ? parts[parts.length - 1] : "";
      const middleName =
        parts.length > 2 ? parts.slice(1, -1).join(" ") : "None";

      const updatedPayload = {
        basicInfo: {
          postedBy:
            editValues.find((i) => i.label === "Posted by")?.value || "Self",
          firstName,
          middleName,
          lastName,
          age: parseInt(
            editValues.find((i) => i.label === "Age")?.value || "0",
            10
          ),
          maritalStatus:
            editValues.find((i) => i.label === "Marital Status")?.value || "",
          height: editValues.find((i) => i.label === "Height")?.value || "",
          anyDisability:
            editValues.find((i) => i.label === "Any Disability")?.value ||
            "None",
          healthInformation:
            editValues.find((i) => i.label === "Health Information")?.value ||
            "Not Specified",
          weight: parseInt(
            editValues.find((i) => i.label === "Weight")?.value || "0",
            10
          ),
          complexion:
            editValues.find((i) => i.label === "Complexion")?.value || "",
        },
      };

      const res = await fetch(UPDATE_API_URL, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPayload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to update");
      }

      setInfo(editValues);
      setModalOpen(false);
      setUpdateStatus("Basic info updated successfully!");
    } catch (err: any) {
      setUpdateStatus(err.message || "Update failed");
    } finally {
      saveLock.current = false;
    }
  };

  if (loading)
    return (
      <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-sm text-gray-600 text-center">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-sm text-red-600 text-center">
        {error}
      </div>
    );

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-2">
        <h3 className="text-lg font-semibold text-gray-900">Basic Info</h3>

        <div onClick={openEditor}>
          <EditIconRounded />
        </div>
      </div>

      {/* Responsive GRID */}
      <div className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        gap-4 
        sm:gap-6 
        sm:divide-x 
        divide-dashed 
        divide-gray-300
      ">
        {/* LEFT COLUMN */}
        <div className="space-y-3 sm:pr-6">
          {info.slice(0, Math.ceil(info.length / 2)).map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="w-1/2 text-gray-600">{item.label}</span>
              <span className="w-1/2 text-gray-900 font-medium">
                : {item.value || "—"}
              </span>
            </div>
          ))}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-3 sm:pl-6">
          {info.slice(Math.ceil(info.length / 2)).map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="w-1/2 text-gray-600">{item.label}</span>
              <span className="w-1/2 text-gray-900 font-medium">
                : {item.value || "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="mb-4 text-center">
          <h2 className="text-xl font-Lato text-gray-900">Edit Basic Info</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-3 mb-4">
            {editValues.map((item, idx) => (
              <div key={idx}>
                <Label className="text-sm text-gray-700 mb-1 block">
                  {item.label}
                </Label>

                <input
                  className="
                    w-full 
                    rounded-md 
                    border 
                    border-gray-300 
                    p-2 
                    text-sm 
                    bg-white 
                    text-gray-800 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-rose-700
                  "
                  value={item.value}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="bg-gray-100 text-gray-700 w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button className="bg-rose-700 hover:bg-rose-800 text-white w-full sm:w-auto">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BasicInfoSection;
