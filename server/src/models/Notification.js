import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["vaccination", "appointment", "promotion", "emergency", "order", "system"],
      default: "system"
    },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    channel: { type: String, enum: ["email", "push", "inApp"], default: "inApp" },
    readAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
