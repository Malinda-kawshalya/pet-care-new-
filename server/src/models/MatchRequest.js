import mongoose from "mongoose";

const matchRequestSchema = new mongoose.Schema(
  {
    requesterPet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    targetPet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    message: String,
    status: { type: String, enum: ["pending", "accepted", "rejected", "reported"], default: "pending" },
    reportReason: String
  },
  { timestamps: true }
);

export default mongoose.model("MatchRequest", matchRequestSchema);
