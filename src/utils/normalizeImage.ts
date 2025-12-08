export const normalizeImage = (img: any) => {
  if (!img) return null;

  // Case 1: Backend nested - img.profileImage
  if (typeof img === "object" && img.profileImage) {
    img = img.profileImage;
  }

  // Case 2: Backend object with filename
  if (typeof img === "object" && img.filename) {
    return `https://matrimonial-backend-7ahc.onrender.com/uploads/${img.filename}`;
  }

  // Case 3: Backend object with url property
  if (typeof img === "object" && img.url) {
    if (img.url.startsWith("http")) {
      return img.url;
    }
    return `https://matrimonial-backend-7ahc.onrender.com${img.url}`;
  }

  // Case 4: Blob preview (temporary)
  if (typeof img === "string" && img.startsWith("blob:")) {
    return img;
  }

  // Case 5: Relative uploads path
  if (typeof img === "string" && img.startsWith("/uploads")) {
    return `https://matrimonial-backend-7ahc.onrender.com${img}`;
  }

  // Case 6: Already full URL
  if (typeof img === "string" && img.startsWith("http")) {
    return img;
  }

  // Case 7: Just filename (no path)
  if (typeof img === "string" && !img.includes("/") && !img.startsWith("http")) {
    return `https://matrimonial-backend-7ahc.onrender.com/uploads/${img}`;
  }

  // Default: return as is
  return typeof img === "string" ? img : null;
};