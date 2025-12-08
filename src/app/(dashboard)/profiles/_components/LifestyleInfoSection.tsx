'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Edit3 } from 'lucide-react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type LifestyleSection = {
  label: string;
  items: string[];
  subLabels?: string[];
};

interface LifestyleInfoSectionProps {
  lifestyleInfo?: LifestyleSection[]; // optional initial prop
}

const API_URL = 'https://matrimonial-backend-7ahc.onrender.com/api/profile/self';
const UPDATE_API_URL = 'https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile';

// -----------------------------
// Helpers: mapping API <-> UI
// -----------------------------
const defaultSections = (): LifestyleSection[] => [
  { label: 'Personal Habits', items: ['', '', ''], subLabels: ['Diet', 'Smoking', 'Drinking'] },
  { label: 'Assets', items: ['', '', ''], subLabels: ['Open to Pets', 'Own Car', 'Own House'] },
  { label: 'Food I Cook', items: [''] },
  { label: 'Hobbies', items: [''] },
  { label: 'Interests', items: [''] },
  { label: 'Favorite Music', items: [''] },
  { label: 'Sports', items: [''] },
  { label: 'Cuisine', items: [''] },
  { label: 'Movies', items: [''] },
  { label: 'TV Shows', items: [''] },
  { label: 'Vacation Destination', items: [''] },
];

const mapApiToSections = (lifestyleHobbies: any): LifestyleSection[] => {
  if (!lifestyleHobbies) return defaultSections();

  const boolToYesNo = (v: any) => (v === true || v === 'true' ? 'Yes' : v === false || v === 'false' ? 'No' : String(v || ''));

  return [
    {
      label: 'Personal Habits',
      items: [lifestyleHobbies.diet || '', lifestyleHobbies.smoking || '', lifestyleHobbies.drinking || ''],
      subLabels: ['Diet', 'Smoking', 'Drinking'],
    },
    {
      label: 'Assets',
      items: [
        boolToYesNo(lifestyleHobbies.openToPets),
        boolToYesNo(lifestyleHobbies.ownCar),
        boolToYesNo(lifestyleHobbies.ownHouse),
      ],
      subLabels: ['Open to Pets', 'Own Car', 'Own House'],
    },
    { label: 'Food I Cook', items: lifestyleHobbies.foodICook?.length ? lifestyleHobbies.foodICook : [''] },
    { label: 'Hobbies', items: lifestyleHobbies.hobbies?.length ? lifestyleHobbies.hobbies : [''] },
    { label: 'Interests', items: lifestyleHobbies.interests?.length ? lifestyleHobbies.interests : [''] },
    { label: 'Favorite Music', items: lifestyleHobbies.favoriteMusic?.length ? lifestyleHobbies.favoriteMusic : [''] },
    { label: 'Sports', items: lifestyleHobbies.sports?.length ? lifestyleHobbies.sports : [''] },
    { label: 'Cuisine', items: lifestyleHobbies.cuisine?.length ? lifestyleHobbies.cuisine : [''] },
    { label: 'Movies', items: lifestyleHobbies.movies?.length ? lifestyleHobbies.movies : [''] },
    { label: 'TV Shows', items: lifestyleHobbies.tvShows?.length ? lifestyleHobbies.tvShows : [''] },
    { label: 'Vacation Destination', items: lifestyleHobbies.vacationDestination?.length ? lifestyleHobbies.vacationDestination : [''] },
  ];
};

const mapSectionsToPayload = (sections: LifestyleSection[]) => {
  const payload: any = {};
  sections.forEach((section) => {
    switch (section.label) {
      case 'Personal Habits':
        payload.diet = section.items[0] || '';
        payload.smoking = section.items[1] || '';
        payload.drinking = section.items[2] || '';
        break;
      case 'Assets':
        // Keep boolean values for server
        payload.openToPets = section.items[0] === 'Yes';
        payload.ownCar = section.items[1] === 'Yes';
        payload.ownHouse = section.items[2] === 'Yes';
        break;
      case 'Food I Cook':
        payload.foodICook = section.items.filter(Boolean);
        break;
      case 'Hobbies':
        payload.hobbies = section.items.filter(Boolean);
        break;
      case 'Interests':
        payload.interests = section.items.filter(Boolean);
        break;
      case 'Favorite Music':
        payload.favoriteMusic = section.items.filter(Boolean);
        break;
      case 'Sports':
        payload.sports = section.items.filter(Boolean);
        break;
      case 'Cuisine':
        payload.cuisine = section.items.filter(Boolean);
        break;
      case 'Movies':
        payload.movies = section.items.filter(Boolean);
        break;
      case 'TV Shows':
        payload.tvShows = section.items.filter(Boolean);
        break;
      case 'Vacation Destination':
        payload.vacationDestination = section.items.filter(Boolean);
        break;
      default: {
        const key =
          section.label.replace(/\s+/g, '').charAt(0).toLowerCase() +
          section.label.replace(/\s+/g, '').slice(1);
        payload[key] = section.items.filter(Boolean);
      }
    }
  });
  return { lifestyleHobbies: payload };
};

// Utility: deep clone sections to avoid accidental mutation
const cloneSections = (s: LifestyleSection[]) => s.map((sec) => ({ ...sec, items: [...sec.items], subLabels: sec.subLabels ? [...sec.subLabels] : undefined }));

// -----------------------------
// Component
// -----------------------------
const LifestyleInfoSection: React.FC<LifestyleInfoSectionProps> = ({ lifestyleInfo }) => {
  const [info, setInfo] = useState<LifestyleSection[]>(() => (lifestyleInfo && lifestyleInfo.length ? cloneSections(lifestyleInfo) : defaultSections()));
  const [editValues, setEditValues] = useState<LifestyleSection[]>(() => (lifestyleInfo && lifestyleInfo.length ? cloneSections(lifestyleInfo) : defaultSections()));
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Fetch data on mount
  useEffect(() => {
    isMounted.current = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found. Please log in.');
        const res = await fetch(API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        const mapped = mapApiToSections(data?.data?.lifestyleHobbies || data?.lifestyleHobbies);
        if (!isMounted.current) return;
        setInfo(mapped);
        setEditValues(cloneSections(mapped));
      } catch (err: any) {
        if (!isMounted.current) return;
        setError(err.message || 'Failed to fetch lifestyle info');
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted.current = false;
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, []);

  // Debounced auto-save (called when user edits fields)
  const scheduleAutoSave = (updated: LifestyleSection[]) => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => autoSave(updated), 700);
  };

  const autoSave = async (updatedValues: LifestyleSection[]) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return; // don't show error for autosave if not logged in
      const payload = mapSectionsToPayload(updatedValues);
      const res = await fetch(UPDATE_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Auto-save failed');
      // optimistic UI already updated; confirm with server response if needed
      setInfo(cloneSections(updatedValues));
      setUpdateStatus('Changes saved automatically!');
      // clear status after a short time
      setTimeout(() => setUpdateStatus(null), 2000);
    } catch (err: any) {
      console.error('Auto-save error:', err);
      setUpdateStatus('Auto-save failed');
      setTimeout(() => setUpdateStatus(null), 3000);
    }
  };

  // user changed an input in modal — update editValues and schedule autosave (for inline auto-save)
  const handleSectionChange = (sectionIdx: number, itemIdx: number, value: string) => {
    setEditValues((prev) => {
      const next = cloneSections(prev);
      // ensure array exists
      if (!next[sectionIdx]) return prev;
      next[sectionIdx].items[itemIdx] = value;
      // optimistic preview inside modal might be enough; but we also update preview area (info) so user sees change immediately:
      setInfo((cur) => {
        const curClone = cloneSections(cur);
        if (!curClone[sectionIdx]) return cur;
        curClone[sectionIdx].items[itemIdx] = value;
        return curClone;
      });
      scheduleAutoSave(next);
      return next;
    });
  };

  // Add item for multi-item sections
  const addItemToSection = (sectionIdx: number) => {
    setEditValues((prev) => {
      const next = cloneSections(prev);
      next[sectionIdx].items.push('');
      return next;
    });
  };

  // Remove item
  const removeItemFromSection = (sectionIdx: number, itemIdx: number) => {
    setEditValues((prev) => {
      const next = cloneSections(prev);
      if (!next[sectionIdx]) return prev;
      next[sectionIdx].items = next[sectionIdx].items.filter((_, i) => i !== itemIdx);
      // also update preview immediately
      setInfo((cur) => {
        const curClone = cloneSections(cur);
        if (!curClone[sectionIdx]) return cur;
        curClone[sectionIdx].items = curClone[sectionIdx].items.filter((_, i) => i !== itemIdx);
        return curClone;
      });
      scheduleAutoSave(next);
      return next;
    });
  };

  // Manual save triggered by user
  const handleSave = async () => {
    setUpdateStatus(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token found. Please log in.');

      const payload = mapSectionsToPayload(editValues);
      const res = await fetch(UPDATE_API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => null);
        throw new Error(text || 'Failed to update lifestyle info');
      }

      const json = await res.json().catch(() => null);
      const mapped = mapApiToSections(json?.data?.lifestyleHobbies || json?.lifestyleHobbies || payload.lifestyleHobbies);
      // set both preview and edit values to returned mapping (server authoritative)
      setInfo(mapped);
      setEditValues(cloneSections(mapped));
      setModalOpen(false);
      setUpdateStatus('Lifestyle info updated successfully!');
      setTimeout(() => setUpdateStatus(null), 2500);
    } catch (err: any) {
      console.error('Save error:', err);
      setUpdateStatus(err.message || 'Failed to update lifestyle info');
      setTimeout(() => setUpdateStatus(null), 4000);
    }
  };

  if (loading) return <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-sm text-gray-600">Loading...</div>;
  if (error) return <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-sm text-red-500">{error}</div>;

  return (
    <div className="bg-[#FFF8F0] rounded-2xl p-6 shadow-sm">
      {updateStatus && (
        <div className={`mb-4 p-2 rounded ${updateStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {updateStatus}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Lifestyle & Hobbies</h3>
        <Edit3 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" onClick={() => { setEditValues(cloneSections(info)); setModalOpen(true); }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-dashed divide-gray-300">
        <div className="pr-6 space-y-4">
          {info.slice(0, Math.ceil(info.length / 2)).map((section, idx) => (
            <div key={section.label + idx}>
              <div className="text-sm font-semibold text-gray-900 mb-1">{section.label}</div>
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex justify-between text-sm text-gray-700 mb-1">
                  <span className="text-gray-600 w-1/2">{section.subLabels ? section.subLabels[itemIdx] : section.label}</span>
                  <span className="font-medium w-1/2 text-right">{item || 'Not specified'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="pl-6 space-y-4">
          {info.slice(Math.ceil(info.length / 2)).map((section, idx) => (
            <div key={section.label + idx}>
              <div className="text-sm font-semibold text-gray-900 mb-1">{section.label}</div>
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex justify-between text-sm text-gray-700 mb-1">
                  <span className="text-gray-600 w-1/2">{section.subLabels ? section.subLabels[itemIdx] : section.label}</span>
                  <span className="font-medium w-1/2 text-right">{item || 'Not specified'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <div className="flex flex-col items-center justify-center gap-3 mb-4">
          <h2 className="text-xl font-Lato text-gray-900">Edit Lifestyle & Hobbies</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="mb-4 w-full space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {editValues.map((section, sectionIdx) => (
              <div key={section.label + sectionIdx} className="pb-3 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-Inter text-gray-700">{section.label}</Label>

                  {/* show add button only for multi-item lists */}
                  {['Movies', 'Food I Cook', 'Hobbies', 'Interests', 'TV Shows', 'Favorite Music', 'Sports', 'Cuisine', 'Vacation Destination'].includes(section.label) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 text-xs"
                      onClick={() => addItemToSection(sectionIdx)}
                    >
                      + Add
                    </Button>
                  )}
                </div>

                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="mb-2 flex items-center gap-2">
                    <div className="flex-1">
                      {section.subLabels && section.subLabels[itemIdx] && (
                        <Label className="text-xs font-Inter text-gray-600 mb-1 block">{section.subLabels[itemIdx]}</Label>
                      )}
                      <input
                        className="w-full rounded-md border border-gray-300 p-2 font-Inter bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-700 mt-1 text-xs"
                        value={item || ''}
                        onChange={(e) => handleSectionChange(sectionIdx, itemIdx, e.target.value)}
                        placeholder={section.subLabels?.[itemIdx] || `Enter ${section.label.toLowerCase()}`}
                      />
                    </div>

                    {['Movies', 'Food I Cook', 'Hobbies', 'Interests', 'TV Shows', 'Favorite Music', 'Sports', 'Cuisine', 'Vacation Destination'].includes(section.label) && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItemFromSection(sectionIdx, itemIdx)}
                      >
                        X
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" className="bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setModalOpen(false)}>
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

export default LifestyleInfoSection;
