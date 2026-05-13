import express from "express";
import { healthRisk, predictVaccination } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/predict-vaccination", protect, predictVaccination);
router.post("/health-risk", protect, healthRisk);

export default router;
