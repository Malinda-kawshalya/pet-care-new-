import express from "express";
import { analytics, listUsers, updateApproval } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/users", listUsers);
router.patch("/users/:id/approval", updateApproval);
router.get("/analytics", analytics);

export default router;
