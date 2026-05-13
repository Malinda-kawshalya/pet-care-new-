import express from "express";
import {
  changePassword,
  forgotPassword,
  getProfile,
  login,
  register,
  resendVerification,
  resetPassword,
  updateProfile,
  verifyEmail
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", (_req, res) => res.json({ message: "Logged out on client" }));
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", protect, resendVerification);

export default router;
