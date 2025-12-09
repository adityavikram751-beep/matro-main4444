'use client';
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type ReligiousInfoItem = { label: string; value: string };

interface ReligiousInfoSectionProps {
  religiousInfo: ReligiousInfoItem[];
}

const API_URL = 'https://matrimonial-backend-7ahc.onrender.com/api/profile/self';
const UPDATE_API_URL = 'https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile';

// ===============================================
// CUSTOM EDIT ICON (same as screenshot + all sections)
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

const ReligiousInfoSection: React.FC<ReligiousInfoSectionProps> = ({ religiousInfo }) => {
  const [info, setInfo] = useState<ReligiousInfoItem[]>(religiousInfo);
  const [modalOpen, setModalOpen] = useState(false);
  const [editValues, setEditValues] = useState<ReligiousInfoItem[]>(religiousInfo);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  // ------------------------------------
  // Fetch religious profile details
  // ------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found.');

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        const religious = data?.data?.religionDetails || {};

        const mapped: ReligiousInfoItem[] = [
          { label: 'Religion', value: religious.religion || '' },
          { label: 'Mother Tongue', value: religious.motherTongue || '' },
          { label: 'Community', value: religious.community || '' },
          { label: 'Caste No Bar', value: religious.casteNoBar || '' },
          { label: 'Gotra/Gothra', value: religious.gothra || '' },
        ];

        setInfo(mapped);
        setEditValues(mapped);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditValues(info);
    setModalOpen(true);
  };

  const handleInputChange = (index: number, value: string) => {
    setEditValues(prev =>
      prev.map((item, i) => (i === index ? { ...item, value } : item))
    );
  };

  // ------------------------------------
  // SAVE Updated Data
  // ------------------------------------
  const handleSave = async () => {
    setUpdateStatus(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found.');

      const payload = {
        religionDetails: {
          religion: editValues[0].value,
          motherTongue: editValues[1].value,
          community: editValues[2].value,
          casteNoBar: editValues[3].value,
          gothra: editValues[4].value,
        },
      };

      const res = await fetch(UPDATE_API_URL, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to update religious info');

      setInfo(editValues);
      setModalOpen(false);
      setUpdateStatus('Religious info updated successfully!');
    } catch (err: any) {
      setUpdateStatus(err.message || 'Failed to update religious info');
    }
  };

  // ------------------------------------
  // UI Rendering
  // ------------------------------------

  if (loading)
    return <div className="bg-[#FFF8F0] p-6 shadow-sm text-gray-600">Loading...</div>;

  if (error)
    return <div className="bg-[#FFF8F0] p-6 shadow-sm text-red-500">{error}</div>;

  return (
    <div className="bg-[#FFF8F0] p-6 shadow-sm">
      {updateStatus && (
        <div
          className={`mb-4 p-2 rounded ${
            updateStatus.includes('successfully')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {updateStatus}
        </div>
      )}

      {/* Header + Custom Edit Icon */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Religious Background</h3>

        {/* 🔥 UPDATED ICON HERE */}
        <div onClick={handleEdit}>
          <EditIconRounded />
        </div>
      </div>

      {/* Data Display */}
      <div className="grid grid-cols-2 divide-x divide-dashed divide-gray-300">
        <div className="space-y-3 pr-6">
          {info.slice(0, 3).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600 w-1/2">{item.label}</span>
              <span className="text-gray-900 font-medium w-1/2">: {item.value}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3 pl-6">
          {info.slice(3).map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-gray-600 w-1/2">{item.label}</span>
              <span className="text-gray-900 font-medium w-1/2">: {item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col items-center gap-3 mb-4">
          <h2 className="text-xl font-Lato text-gray-900">Edit Religious Info</h2>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="mb-4 w-full space-y-3">
            {editValues.map((item, index) => (
              <div key={index}>
                <Label className="text-sm text-gray-700 mb-1 block">{item.label}</Label>
                <input
                  className="w-full rounded-md border border-gray-300 p-2 bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-700"
                  value={item.value}
                  onChange={e => handleInputChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="bg-gray-100" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-rose-700 hover:bg-rose-800 text-white">
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ReligiousInfoSection;
