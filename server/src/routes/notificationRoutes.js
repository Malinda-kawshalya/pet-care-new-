import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { listNotifications, markAllRead, markRead } from "../controllers/notificationController.js";

const router = express.Router();

router.use(protect);

router.get("/", listNotifications);
router.patch("/", markAllRead);
router.patch("/:id", markRead);

export default router;