import { Profile } from "@/types/Profile"

export const getFilteredProfiles = (profiles: Profile[], activeTab: string): Profile[] => {
  switch (activeTab) {
    case "Profile Match":
      return profiles
    case "Newly Matches":
      return profiles.filter((p) => p.isNew)
    case "Profiles with photo":
      return profiles.filter((p) => p.hasPhoto)
    case "Mutual Matches":
      return profiles.filter((p) => p.isMutual)
    case "Verified":
      return profiles.filter((p) => p.isVerified)
    default:
      return profiles
  }
}