import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = "uploads";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

function fileFilter(_req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  cb(null, allowed.includes(file.mimetype));
}

export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
