export const isProfileComplete = (profile: any) => {
  return !!(
    profile?.basicInfo?.firstName &&
    profile?.basicInfo?.lastName &&
    profile?.basicInfo?.age &&
    profile?.religionDetails?.religion &&
    profile?.familyDetails?.fatherOccupation &&
    profile?.astroDetails?.dateOfBirth &&
    profile?.educationDetails?.highestDegree &&
    profile?.careerDetails?.occupation &&
    profile?.lifestyleHobbies?.diet
  );
};
