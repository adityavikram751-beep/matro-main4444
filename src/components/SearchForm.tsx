'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <Card className="p-4 shadow-lg border-0 bg-white/80 backdrop-blur-sm w-[1272px] h-[167px] flex flex-col justify-between">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
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
            <SelectTrigger>
              <span className="h-8 text-sm flex items-center">
                <SelectValue placeholder="Select" />
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bride">Bride</SelectItem>
              <SelectItem value="groom">Groom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Age
          </label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="22"
              className="w-14 h-8 text-sm"
              value={searchData.ageFrom}
              onChange={(e) =>
                setSearchData({ ...searchData, ageFrom: e.target.value })
              }
            />
            <span className="text-gray-500 text-sm">to</span>
            <Input
              placeholder="30"
              className="w-14 h-8 text-sm"
              value={searchData.ageTo}
              onChange={(e) =>
                setSearchData({ ...searchData, ageTo: e.target.value })
              }
            />
          </div>
        </div>

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
            <SelectTrigger>
            
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
            <SelectTrigger>
              <span className="h-8 text-sm flex items-center">
                <SelectValue placeholder="English" />
              </span>
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

      <Button
        className="w-full bg-[#b91c1c] hover:bg-red-800 text-white font-semibold py-2 text-sm shadow-lg transition-colors duration-200"
        onClick={onBegin}
      >
        Let&apos;s Begin
      </Button>
    </Card>
  );
}