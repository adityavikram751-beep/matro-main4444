// types/Profile.ts
export interface Profile {
    id: string
    name: string
    profileId: string
    lastSeen: string
    age: number
    height: string
    caste: string
    profession: string
    salary: string
    education: string
    location: string
    languages: string[]
    image: string
    isNew?: boolean
    hasPhoto?: boolean
    isMutual?: boolean
    isVerified?: boolean
  }