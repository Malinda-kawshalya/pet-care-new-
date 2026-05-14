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

router.use(protect);

router.get("/", listAdoptions);
router.post("/", createAdoption);
router.post("/:id/requests", requestAdoption);
router.patch("/:id/requests/respond", respondAdoptionRequest);
router.post("/:id/contact", contactAdoptionOwner);

export default router;