export function getUploadUrl(value, fallback = "/placeholder.png") {
  if (!value) return fallback;

  const normalized = String(value).replace(/\\/g, "/");
  if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  const pathValue = normalized.startsWith("/") ? normalized : `/${normalized}`;
  if (pathValue.startsWith("/uploads/")) {
    return pathValue;
  }

  return pathValue;
}