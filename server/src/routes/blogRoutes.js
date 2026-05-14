import express from "express";
import Blog from "../models/Blog.js";
import { protect, authorize, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public listing: show published posts to unauthenticated users.
router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === "admin";
    const filter = isAdmin ? {} : { status: "published" };
    const items = await Blog.find(filter)
      .populate("author", "name role")
      .sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const item = await Blog.findById(req.params.id).populate("author", "name role");
    if (!item) {
      res.status(404);
      throw new Error("Blog not found");
    }
    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin && item.status !== "published") {
      res.status(403);
      throw new Error("Not authorized to view this blog");
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.post("/", protect, authorize("admin"), async (req, res, next) => {
  try {
    const item = await Blog.create({
      ...req.body,
      author: req.user._id,
      status: req.body.status || "published"
    });
    const hydrated = await Blog.findById(item._id).populate("author", "name role");
    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const item = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate("author", "name role");
    if (!item) {
      res.status(404);
      throw new Error("Blog not found");
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const item = await Blog.findByIdAndDelete(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Blog not found");
    }
    res.json({ message: "Blog deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;