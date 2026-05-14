import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true }
  },
  { _id: true, timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    tags: [String],
    status: {
      type: String,
      enum: ["open", "closed", "flagged", "removed"],
      default: "open"
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderatedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Discussion", discussionSchema);
