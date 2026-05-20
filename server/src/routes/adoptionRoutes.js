import express from "express";
import { optionalAuth, protect } from "../middleware/authMiddleware.js";
import {
  contactAdoptionOwner,
  createAdoption,
  deleteAdoption,
  listAdoptions,
  requestAdoption,
  respondAdoptionRequest,
  updateAdoption
} from "../controllers/adoptionController.js";

const router = express.Router();

router.get("/", optionalAuth, listAdoptions);
router.post("/", protect, createAdoption);
router.put("/:id", protect, updateAdoption);
router.delete("/:id", protect, deleteAdoption);
router.post("/:id/requests", protect, requestAdoption);
router.patch("/:id/requests/respond", protect, respondAdoptionRequest);
router.post("/:id/contact", protect, contactAdoptionOwner);

export default router;
