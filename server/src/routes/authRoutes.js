import express from "express";
import { getProfile, login, register, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/logout", (_req, res) => res.json({ message: "Logged out on client" }));
router.post("/forgot-password", (_req, res) => res.json({ message: "Password reset email placeholder" }));
router.post("/verify-email", (_req, res) => res.json({ message: "Email verification placeholder" }));

export default router;
