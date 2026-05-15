function extractImageValue(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();

  if (typeof value === "object") {
    const candidate = value.url || value.path || value.src || value.secure_url || value.image || value.filename;
    return typeof candidate === "string" ? candidate.trim() : "";
  }

  return "";
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const MEDIA_ORIGIN = API_URL.replace(/\/api\/?$/, "");
const PUBLIC_ASSETS = new Set([
  "placeholder.svg",
  "hero-pet-scene.svg",
  "about-pet-scene.svg",
  "pet-profile-scene.svg",
  "pet-empty-scene.svg"
]);

export const DEFAULT_IMAGE_FALLBACK = "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85";

function isPublicAsset(pathValue) {
  const fileName = String(pathValue || "").replace(/\\/g, "/").replace(/^\/+/, "").split("/").pop();
  return PUBLIC_ASSETS.has(fileName);
}

export function getUploadUrl(value, fallback = DEFAULT_IMAGE_FALLBACK) {
  const extracted = extractImageValue(value);
  if (!extracted) return fallback;

  const normalized = extracted.replace(/\\/g, "/");
  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  if (isPublicAsset(normalized)) {
    return normalized.startsWith("/") ? normalized : `/${normalized.replace(/^\/+/, "")}`;
  }

  if (normalized.startsWith("/uploads/")) {
    return `${MEDIA_ORIGIN}${normalized}`;
  }

  if (normalized.startsWith("uploads/")) {
    return `${MEDIA_ORIGIN}/${normalized}`;
  }

  const pathValue = normalized.startsWith("/") ? normalized : `/${normalized}`;

  // Support payloads that store only the uploaded file name.
  if (!pathValue.slice(1).includes("/") && /\.[a-z0-9]+$/i.test(pathValue)) {
    return `${MEDIA_ORIGIN}/uploads${pathValue}`;
  }

  return pathValue;
}