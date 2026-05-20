import express from "express";
import Blog from "../models/Blog.js";
import { protect, authorize, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

function canManageBlog(blog, user) {
  return user?.role === "admin" || String(blog.author) === String(user?._id);
}

function blogPayload(body) {
  return {
    title: body.title,
    body: body.body,
    tags: Array.isArray(body.tags) ? body.tags : [],
    image: body.image
  };
}

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

router.post("/", protect, authorize("admin", "petOwner"), async (req, res, next) => {
  try {
    const item = await Blog.create({
      ...blogPayload(req.body),
      author: req.user._id,
      status: req.user.role === "admin" ? req.body.status || "published" : "published"
    });
    const hydrated = await Blog.findById(item._id).populate("author", "name role");
    res.status(201).json({ item: hydrated });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", protect, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }
    if (!canManageBlog(blog, req.user)) {
      res.status(403);
      throw new Error("You can only edit your own blog posts");
    }

    Object.assign(blog, blogPayload(req.body));
    if (req.user.role === "admin" && req.body.status) {
      blog.status = req.body.status;
    }
    await blog.save();

    const item = await Blog.findById(blog._id).populate("author", "name role");
    if (!item) {
      res.status(404);
      throw new Error("Blog not found");
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }
    if (!canManageBlog(blog, req.user)) {
      res.status(403);
      throw new Error("You can only delete your own blog posts");
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted" });
  } catch (error) {
    next(error);
  }
});

export default router;
