import express from "express";
import {
  analytics,
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateApproval,
  updateRole,
  updateUser
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/users", listUsers);
router.post("/users", createUser);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/approval", updateApproval);
router.patch("/users/:id/role", updateRole);
router.get("/analytics", analytics);

export default router;
