export function normalizeUploadPath(value) {
  return String(value || "").replace(/\\/g, "/");
}