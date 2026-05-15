import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  contactAdoptionOwner,
  createAdoption,
  listAdoptions,
  requestAdoption,
  respondAdoptionRequest
} from "../controllers/adoptionController.js";

const router = express.Router();

router.get("/", listAdoptions);
router.post("/", protect, createAdoption);
router.post("/:id/requests", protect, requestAdoption);
router.patch("/:id/requests/respond", protect, respondAdoptionRequest);
router.post("/:id/contact", protect, contactAdoptionOwner);

export default router;