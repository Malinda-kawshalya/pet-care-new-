import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["product", "service", "provider"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
