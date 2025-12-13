'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface SearchFormProps {
  onBegin: () => void;
}

export default function SearchForm({ onBegin }: SearchFormProps) {
  const [searchData, setSearchData] = useState({
    lookingFor: '',
    ageFrom: '',
    ageTo: '',
    religion: '',
    motherTongue: '',
  });

  return (
    <Card
      className="
        w-full
        max-w-7xl
        mx-auto
        p-4 sm:p-5
        shadow-lg
        border-0
        bg-white/80
        backdrop-blur-sm
        flex
        flex-col
        gap-4
      "
    >
      {/* 🔹 FORM GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* LOOKING FOR */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            I&apos;m looking for a
          </label>
          <Select
            value={searchData.lookingFor}
            onValueChange={(value) =>
              setSearchData({ ...searchData, lookingFor: value })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bride">Bride</SelectItem>
              <SelectItem value="groom">Groom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AGE */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Age
          </label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="22"
              className="h-9 text-sm w-full sm:w-16"
              value={searchData.ageFrom}
              onChange={(e) =>
                setSearchData({ ...searchData, ageFrom: e.target.value })
              }
            />
            <span className="text-gray-500 text-sm">to</span>
            <Input
              placeholder="30"
              className="h-9 text-sm w-full sm:w-16"
              value={searchData.ageTo}
              onChange={(e) =>
                setSearchData({ ...searchData, ageTo: e.target.value })
              }
            />
          </div>
        </div>

        {/* RELIGION */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Of Religion
          </label>
          <Select
            value={searchData.religion}
            onValueChange={(value) =>
              setSearchData({ ...searchData, religion: value })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hindu">Hindu</SelectItem>
              <SelectItem value="muslim">Muslim</SelectItem>
              <SelectItem value="christian">Christian</SelectItem>
              <SelectItem value="sikh">Sikh</SelectItem>
              <SelectItem value="buddhist">Buddhist</SelectItem>
              <SelectItem value="jain">Jain</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* MOTHER TONGUE */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            And Mother Tongue
          </label>
          <Select
            value={searchData.motherTongue}
            onValueChange={(value) =>
              setSearchData({ ...searchData, motherTongue: value })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="English" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">Hindi</SelectItem>
              <SelectItem value="bengali">Bengali</SelectItem>
              <SelectItem value="tamil">Tamil</SelectItem>
              <SelectItem value="telugu">Telugu</SelectItem>
              <SelectItem value="marathi">Marathi</SelectItem>
              <SelectItem value="gujarati">Gujarati</SelectItem>
              <SelectItem value="kannada">Kannada</SelectItem>
              <SelectItem value="malayalam">Malayalam</SelectItem>
              <SelectItem value="punjabi">Punjabi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 🔹 BUTTON */}
      <div className="flex justify-center sm:justify-end">
        <Button
          className="
            w-full
            sm:w-auto
            bg-[#b91c1c]
            hover:bg-red-800
            text-white
            font-semibold
            px-8
            py-2
            text-sm
            shadow-lg
            transition-colors
          "
          onClick={onBegin}
        >
          Let&apos;s Begin
        </Button>
      </div>
    </Card>
  );
}
