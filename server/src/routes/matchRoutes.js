import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createMatchRequest,
  listMatchRequests,
  listMatchablePets,
  reportMatchRequest,
  respondMatchRequest,
  updateMatchProfile
} from "../controllers/matchController.js";

const router = express.Router();

router.use(protect);

router.get("/pets", listMatchablePets);
router.put("/profile/:petId", updateMatchProfile);
router.get("/requests", listMatchRequests);
router.post("/requests", createMatchRequest);
router.patch("/requests/:id/respond", respondMatchRequest);
router.patch("/requests/:id/report", reportMatchRequest);

export default router;