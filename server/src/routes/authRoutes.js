import express from "express";
import {
  changePassword,
  deleteUser,
  forgotPassword,
  getAllUsers,
  getProfile,
  getUser,
  getUserStatistics,
  getPendingApprovals,
  login,
  register,
  resendVerification,
  resetPassword,
  seedDemoAccounts,
  updateProfile,
  updateUserApprovalStatus,
  updateUserRole,
  verifyEmail
} from "../controllers/authController.js";
import { protect, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);

// Protected routes
router.get("/me", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);
router.post("/logout", (_req, res) => res.json({ message: "Logged out on client" }));
router.post("/resend-verification", protect, resendVerification);

// Admin routes
router.post("/seed-demo", seedDemoAccounts);
router.get("/users", protect, roleMiddleware(["admin"]), getAllUsers);
router.get("/users/:userId", protect, roleMiddleware(["admin"]), getUser);
router.put("/users/:userId/approval", protect, roleMiddleware(["admin"]), updateUserApprovalStatus);
router.put("/users/:userId/role", protect, roleMiddleware(["admin"]), updateUserRole);
router.delete("/users/:userId", protect, roleMiddleware(["admin"]), deleteUser);
router.get("/stats/users", protect, roleMiddleware(["admin"]), getUserStatistics);
router.get("/approvals/pending", protect, roleMiddleware(["admin"]), getPendingApprovals);

export default router;
