import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Deprecated, use recipient
    relatedPet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
    subject: String,
    body: { type: String, required: true },
    status: { type: String, enum: ["unread", "read", "archived"], default: "unread" },
    readAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
