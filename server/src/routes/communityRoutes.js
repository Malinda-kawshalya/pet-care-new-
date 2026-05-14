import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addDiscussionReply,
  addPostComment,
  createDiscussion,
  createPost,
  deleteDiscussion,
  deletePost,
  listDiscussions,
  listPosts,
  moderateDiscussion,
  moderatePost,
  moderationQueue,
  removeDiscussionReply,
  removePostComment,
  toggleDiscussionLike,
  togglePostLike,
  updateDiscussion,
  updatePost
} from "../controllers/communityController.js";

const router = express.Router();

router.get("/posts", protect, listPosts);
router.post("/posts", protect, createPost);
router.put("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);
router.patch("/posts/:id/moderate", protect, moderatePost);
router.post("/posts/:id/like", protect, togglePostLike);
router.post("/posts/:id/comments", protect, addPostComment);
router.delete("/posts/:id/comments/:commentId", protect, removePostComment);

router.get("/discussions", protect, listDiscussions);
router.post("/discussions", protect, createDiscussion);
router.put("/discussions/:id", protect, updateDiscussion);
router.delete("/discussions/:id", protect, deleteDiscussion);
router.patch("/discussions/:id/moderate", protect, moderateDiscussion);
router.post("/discussions/:id/like", protect, toggleDiscussionLike);
router.post("/discussions/:id/replies", protect, addDiscussionReply);
router.delete("/discussions/:id/replies/:replyId", protect, removeDiscussionReply);

router.get("/moderation-queue", protect, moderationQueue);

export default router;
