import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  bookingHistory,
  createAppointment,
  deleteAppointment,
  getSlots,
  listAppointments,
  listProviders,
  updateAppointment
} from "../controllers/appointmentController.js";

const router = express.Router();

router.use(protect);

router.get("/", listAppointments);
router.get("/history", bookingHistory);
router.get("/providers", listProviders);
router.get("/slots", getSlots);
router.post("/", createAppointment);
router.patch("/:id", updateAppointment);
router.delete("/:id", deleteAppointment);

export default router;