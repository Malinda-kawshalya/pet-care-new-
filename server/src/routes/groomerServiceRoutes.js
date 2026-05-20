import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createService,
  deleteService,
  listMyServices,
  listPublicServices,
  updateService
} from "../controllers/groomerServiceController.js";

const router = express.Router();

router.get("/", listPublicServices);
router.get("/mine", protect, listMyServices);
router.post("/", protect, createService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

export default router;
