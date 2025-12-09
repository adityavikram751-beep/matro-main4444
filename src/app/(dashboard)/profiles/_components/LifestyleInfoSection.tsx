'use client';
import React, { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type LifestyleSection = {
  label: string;
  items: string[];
  subLabels?: string[];
};

interface LifestyleInfoSectionProps {
  lifestyleInfo?: LifestyleSection[];
}

const API_URL = 'https://matrimonial-backend-7ahc.onrender.com/api/profile/self';
const UPDATE_API_URL = 'https://matrimonial-backend-7ahc.onrender.com/api/profile/update-profile';

/* ---------------- CUSTOM EDIT ICON ---------------- */
const EditIconRounded = ({ onClick }: { onClick?: () => void }) => (
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
    onClick={onClick}
  >
    <rect x="3" y="3" width="18" height="18" rx="4" ry="4" />
    <path d="M12 8L8 12L7 16L11 15L15 11" />
    <path d="M14 6L18 10" />
  </svg>
);

/* ---------------- DEFAULT SECTIONS ---------------- */
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

const boolToYesNo = (v: any) =>
  v === true || v === 'true' ? 'Yes' : v === false || v === 'false' ? 'No' : String(v || '');

const mapApiToSections = (lifestyleHobbies: any): LifestyleSection[] => {
  if (!lifestyleHobbies) return defaultSections();

  return [
    {
      label: 'Personal Habits',
      items: [
        lifestyleHobbies.diet || '',
        lifestyleHobbies.smoking || '',
        lifestyleHobbies.drinking || '',
      ],
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

const cloneSections = (s: LifestyleSection[]) =>
  s.map((sec) => ({
    ...sec,
    items: [...sec.items],
    subLabels: sec.subLabels ? [...sec.subLabels] : undefined,
  }));

/* ---------------- COMPONENT ---------------- */
const LifestyleInfoSection: React.FC<LifestyleInfoSectionProps> = ({ lifestyleInfo }) => {
  const [info, setInfo] = useState<LifestyleSection[]>(
    () => (lifestyleInfo && lifestyleInfo.length ? cloneSections(lifestyleInfo) : defaultSections())
  );
  const [editValues, setEditValues] = useState<LifestyleSection[]>(
    () => (lifestyleInfo && lifestyleInfo.length ? cloneSections(lifestyleInfo) : defaultSections())
  );

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  /* ---------------- FETCH DATA ---------------- */
  useEffect(() => {
    isMounted.current = true;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Login required.');

        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load lifestyle info');

        const data = await res.json();
        const mapped = mapApiToSections(data?.data?.lifestyleHobbies);

        if (!isMounted.current) return;

        setInfo(mapped);
        setEditValues(cloneSections(mapped));
      } catch (err: any) {
        if (!isMounted.current) return;
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted.current = false;
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, []);

  /* ---------------- AUTO SAVE ---------------- */
  const scheduleAutoSave = (updated: LifestyleSection[]) => {
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => autoSave(updated), 700);
  };

  const autoSave = async (updatedValues: LifestyleSection[]) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const payload = mapSectionsToPayload(updatedValues);

      const res = await fetch(UPDATE_API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Auto-save failed');

      setInfo(cloneSections(updatedValues));
      setUpdateStatus('Changes auto-saved!');
      setTimeout(() => setUpdateStatus(null), 1500);
    } catch {
      setUpdateStatus('Auto-save failed');
    }
  };

  /* ---------------- MAIN UI ---------------- */
  if (loading)
    return <div className="bg-[#FFF8F0] p-6 rounded-2xl shadow-sm">Loading...</div>;

  if (error)
    return <div className="bg-[#FFF8F0] p-6 rounded-2xl text-red-500 shadow-sm">{error}</div>;

  return (
    <div className="bg-[#FFF8F0] rounded-2xl p-6 shadow-sm">
      {updateStatus && (
        <div className="mb-4 p-2 rounded bg-green-100 text-green-700">{updateStatus}</div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Lifestyle & Hobbies</h3>

        {/* UPDATED CUSTOM ICON */}
        <EditIconRounded onClick={() => { setEditValues(cloneSections(info)); setModalOpen(true); }} />
      </div>

      {/* TWO COLUMN PREVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-dashed divide-gray-300">
        <div className="pr-6 space-y-4">
          {info.slice(0, Math.ceil(info.length / 2)).map((section, idx) => (
            <div key={idx}>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {section.label}
              </div>
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-700 mb-1">
                  <span className="w-1/2 text-gray-600">
                    {section.subLabels ? section.subLabels[i] : section.label}
                  </span>
                  <span className="w-1/2 text-right font-medium">{item || 'Not specified'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="pl-6 space-y-4">
          {info.slice(Math.ceil(info.length / 2)).map((section, idx) => (
            <div key={idx}>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {section.label}
              </div>
              {section.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-700 mb-1">
                  <span className="w-1/2 text-gray-600">
                    {section.subLabels ? section.subLabels[i] : section.label}
                  </span>
                  <span className="w-1/2 text-right font-medium">{item || 'Not specified'}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ------------------- MODAL ------------------- */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h2 className="text-xl text-center font-Lato text-gray-900 mb-4">
          Edit Lifestyle & Hobbies
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 mb-4">
            {editValues.map((section, secIdx) => (
              <div key={secIdx} className="pb-3 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-sm font-medium">{section.label}</Label>

                  {[
                    'Movies',
                    'Food I Cook',
                    'Hobbies',
                    'Interests',
                    'TV Shows',
                    'Favorite Music',
                    'Sports',
                    'Cuisine',
                    'Vacation Destination',
                  ].includes(section.label) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const upd = cloneSections(editValues);
                        upd[secIdx].items.push('');
                        setEditValues(upd);
                      }}
                    >
                      + Add
                    </Button>
                  )}
                </div>

                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="mb-2 flex gap-2 items-center">
                    <div className="flex-1">
                      {section.subLabels?.[itemIdx] && (
                        <Label className="text-xs text-gray-600 block mb-1">
                          {section.subLabels[itemIdx]}
                        </Label>
                      )}
                      <input
                        className="w-full rounded-md border border-gray-300 p-2 text-xs focus:ring-2 focus:ring-rose-700"
                        value={item}
                        onChange={(e) => {
                          const upd = cloneSections(editValues);
                          upd[secIdx].items[itemIdx] = e.target.value;
                          setEditValues(upd);
                          scheduleAutoSave(upd);
                        }}
                      />
                    </div>

                    {[
                      'Movies',
                      'Food I Cook',
                      'Hobbies',
                      'Interests',
                      'TV Shows',
                      'Favorite Music',
                      'Sports',
                      'Cuisine',
                      'Vacation Destination',
                    ].includes(section.label) && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const upd = cloneSections(editValues);
                          upd[secIdx].items.splice(itemIdx, 1);
                          setEditValues(upd);
                          scheduleAutoSave(upd);
                        }}
                      >
                        X
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="bg-gray-100"
            >
              Cancel
            </Button>
            <Button className="bg-rose-700 text-white hover:bg-rose-800">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LifestyleInfoSection;
