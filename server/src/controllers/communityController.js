import Blog from "../models/Blog.js";
import Discussion from "../models/Discussion.js";

function isAdmin(user) {
  return user?.role === "admin";
}

function canEditResource(resource, user) {
  return isAdmin(user) || String(resource.author) === String(user?._id);
}

export async function listPosts(req, res, next) {
  try {
    const { q = "", status } = req.query;
    const filters = {};

    if (status && isAdmin(req.user)) {
      filters.status = status;
    } else if (!isAdmin(req.user)) {
      filters.status = "published";
    }

    const items = await Blog.find(filters)
      .populate("author", "name role")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 })
      .limit(200);

    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.title, item.body, item.author?.name, ...(item.tags || [])]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(search));
    });

    return res.json({ items: normalized });
  } catch (error) {
    return next(error);
  }
}

export async function createPost(req, res, next) {
  try {
    const { title, body, tags = [], image } = req.body;
    if (!title || !body) {
      res.status(400);
      throw new Error("Title and body are required");
    }

    const item = await Blog.create({
      author: req.user._id,
      title,
      body,
      tags,
      image,
      status: "published"
    });

    const hydrated = await Blog.findById(item._id).populate("author", "name role");
    return res.status(201).json({ item: hydrated });
  } catch (error) {
    return next(error);
  }
}

export async function updatePost(req, res, next) {
  try {
    const item = await Blog.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (!canEditResource(item, req.user)) {
      res.status(403);
      throw new Error("Not allowed to edit this post");
    }

    const editable = ["title", "body", "tags", "image"];
    editable.forEach((key) => {
      if (req.body[key] !== undefined) item[key] = req.body[key];
    });

    if (!isAdmin(req.user) && item.status === "published") {
      item.status = "draft";
    }

    await item.save();
    const hydrated = await Blog.findById(item._id)
      .populate("author", "name role")
      .populate("comments.user", "name");
    return res.json({ item: hydrated });
  } catch (error) {
    return next(error);
  }
}

export async function deletePost(req, res, next) {
  try {
    const item = await Blog.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (!canEditResource(item, req.user)) {
      res.status(403);
      throw new Error("Not allowed to delete this post");
    }

    await Blog.findByIdAndDelete(item._id);
    return res.json({ message: "Post deleted", id: req.params.id });
  } catch (error) {
    return next(error);
  }
}

export async function togglePostLike(req, res, next) {
  try {
    const item = await Blog.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Post not found");
    }

    const userId = String(req.user._id);
    const hasLiked = item.likes.some((id) => String(id) === userId);

    if (hasLiked) {
      item.likes = item.likes.filter((id) => String(id) !== userId);
    } else {
      item.likes.push(req.user._id);
    }

    await item.save();
    return res.json({ liked: !hasLiked, likesCount: item.likes.length });
  } catch (error) {
    return next(error);
  }
}

export async function addPostComment(req, res, next) {
  try {
    const item = await Blog.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (!req.body.body?.trim()) {
      res.status(400);
      throw new Error("Comment body is required");
    }

    item.comments.push({ user: req.user._id, body: req.body.body.trim() });
    await item.save();

    const hydrated = await Blog.findById(item._id)
      .populate("author", "name role")
      .populate("comments.user", "name");

    return res.status(201).json({ item: hydrated });
  } catch (error) {
    return next(error);
  }
}

export async function removePostComment(req, res, next) {
  try {
    const item = await Blog.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Post not found");
    }

    const comment = item.comments.id(req.params.commentId);
    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }

    if (!isAdmin(req.user) && String(comment.user) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not allowed to remove this comment");
    }

    comment.deleteOne();
    await item.save();
    return res.json({ message: "Comment removed" });
  } catch (error) {
    return next(error);
  }
}

export async function moderatePost(req, res, next) {
  try {
    if (!isAdmin(req.user)) {
      res.status(403);
      throw new Error("Only admins can moderate posts");
    }

    const { status } = req.body;
    if (!["draft", "published", "flagged"].includes(status)) {
      res.status(400);
      throw new Error("Invalid moderation status");
    }

    const item = await Blog.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("author", "name role")
      .populate("comments.user", "name");

    if (!item) {
      res.status(404);
      throw new Error("Post not found");
    }

    return res.json({ item });
  } catch (error) {
    return next(error);
  }
}

export async function listDiscussions(req, res, next) {
  try {
    const { q = "", status } = req.query;
    const filters = {};

    if (status && isAdmin(req.user)) {
      filters.status = status;
    } else if (!isAdmin(req.user)) {
      filters.status = { $ne: "removed" };
    }

    const items = await Discussion.find(filters)
      .populate("author", "name role")
      .populate("replies.user", "name")
      .sort({ createdAt: -1 })
      .limit(200);

    const normalized = items.filter((item) => {
      if (!q) return true;
      const search = q.toLowerCase();
      return [item.title, item.body, item.author?.name, ...(item.tags || [])]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(search));
    });

    return res.json({ items: normalized });
  } catch (error) {
    return next(error);
  }
}

export async function createDiscussion(req, res, next) {
  try {
    const { title, body, tags = [] } = req.body;
    if (!title || !body) {
      res.status(400);
      throw new Error("Title and body are required");
    }

    const item = await Discussion.create({
      author: req.user._id,
      title,
      body,
      tags
    });

    const hydrated = await Discussion.findById(item._id).populate("author", "name role");
    return res.status(201).json({ item: hydrated });
  } catch (error) {
    return next(error);
  }
}

export async function updateDiscussion(req, res, next) {
  try {
    const item = await Discussion.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Discussion not found");
    }

    if (!canEditResource(item, req.user)) {
      res.status(403);
      throw new Error("Not allowed to edit this discussion");
    }

    const editable = ["title", "body", "tags"];
    editable.forEach((key) => {
      if (req.body[key] !== undefined) item[key] = req.body[key];
    });

    await item.save();
    const hydrated = await Discussion.findById(item._id)
      .populate("author", "name role")
      .populate("replies.user", "name");

    return res.json({ item: hydrated });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDiscussion(req, res, next) {
  try {
    const item = await Discussion.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Discussion not found");
    }

    if (!canEditResource(item, req.user)) {
      res.status(403);
      throw new Error("Not allowed to delete this discussion");
    }

    await Discussion.findByIdAndDelete(item._id);
    return res.json({ message: "Discussion deleted", id: req.params.id });
  } catch (error) {
    return next(error);
  }
}

export async function toggleDiscussionLike(req, res, next) {
  try {
    const item = await Discussion.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Discussion not found");
    }

    const userId = String(req.user._id);
    const hasLiked = item.likes.some((id) => String(id) === userId);

    if (hasLiked) {
      item.likes = item.likes.filter((id) => String(id) !== userId);
    } else {
      item.likes.push(req.user._id);
    }

    await item.save();
    return res.json({ liked: !hasLiked, likesCount: item.likes.length });
  } catch (error) {
    return next(error);
  }
}

export async function addDiscussionReply(req, res, next) {
  try {
    const item = await Discussion.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Discussion not found");
    }

    if (!req.body.body?.trim()) {
      res.status(400);
      throw new Error("Reply body is required");
    }

    item.replies.push({ user: req.user._id, body: req.body.body.trim() });
    await item.save();

    const hydrated = await Discussion.findById(item._id)
      .populate("author", "name role")
      .populate("replies.user", "name");

    return res.status(201).json({ item: hydrated });
  } catch (error) {
    return next(error);
  }
}

export async function removeDiscussionReply(req, res, next) {
  try {
    const item = await Discussion.findById(req.params.id);
    if (!item) {
      res.status(404);
      throw new Error("Discussion not found");
    }

    const reply = item.replies.id(req.params.replyId);
    if (!reply) {
      res.status(404);
      throw new Error("Reply not found");
    }

    if (!isAdmin(req.user) && String(reply.user) !== String(req.user._id)) {
      res.status(403);
      throw new Error("Not allowed to remove this reply");
    }

    reply.deleteOne();
    await item.save();
    return res.json({ message: "Reply removed" });
  } catch (error) {
    return next(error);
  }
}

export async function moderateDiscussion(req, res, next) {
  try {
    if (!isAdmin(req.user)) {
      res.status(403);
      throw new Error("Only admins can moderate discussions");
    }

    const { status } = req.body;
    if (!["open", "closed", "flagged", "removed"].includes(status)) {
      res.status(400);
      throw new Error("Invalid moderation status");
    }

    const item = await Discussion.findByIdAndUpdate(
      req.params.id,
      { status, moderatedBy: req.user._id, moderatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("author", "name role")
      .populate("replies.user", "name");

    if (!item) {
      res.status(404);
      throw new Error("Discussion not found");
    }

    return res.json({ item });
  } catch (error) {
    return next(error);
  }
}

export async function moderationQueue(req, res, next) {
  try {
    if (!isAdmin(req.user)) {
      res.status(403);
      throw new Error("Only admins can view moderation queue");
    }

    const [draftPosts, flaggedPosts, flaggedDiscussions] = await Promise.all([
      Blog.find({ status: "draft" }).populate("author", "name role").sort({ createdAt: -1 }),
      Blog.find({ status: "flagged" }).populate("author", "name role").sort({ createdAt: -1 }),
      Discussion.find({ status: "flagged" }).populate("author", "name role").sort({ createdAt: -1 })
    ]);

    return res.json({
      draftPosts,
      flaggedPosts,
      flaggedDiscussions,
      totals: {
        draftPosts: draftPosts.length,
        flaggedPosts: flaggedPosts.length,
        flaggedDiscussions: flaggedDiscussions.length
      }
    });
  } catch (error) {
    return next(error);
  }
}
