import express from "express";
import { protect } from "../middleware/authMiddleware.js";

export default function crudRoutes(controller, { isProtected = true } = {}) {
  const router = express.Router();
  const guards = isProtected ? [protect] : [];

  router.route("/").get(...guards, controller.list).post(...guards, controller.create);
  router.route("/:id").get(...guards, controller.get).put(...guards, controller.update).delete(...guards, controller.remove);

  return router;
}
