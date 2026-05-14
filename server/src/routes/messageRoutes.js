import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  listConversation,
  listThreads,
  markConversationRead,
  sendMessage
} from "../controllers/messageController.js";

const router = express.Router();

router.use(protect);

router.get("/", listThreads);
router.get("/conversation/:userId", listConversation);
router.post("/", sendMessage);
router.patch("/conversation/:userId/read", markConversationRead);

export default router;