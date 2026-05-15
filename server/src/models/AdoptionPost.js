import mongoose from "mongoose";

const adoptionPostSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    adoptionFee: { type: Number, default: 0 },
    location: String,
    status: { type: String, enum: ["open", "pendingApproval", "adopted", "closed"], default: "open" },
    requests: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        applicantName: String,
        applicantEmail: String,
        applicantPhone: String,
        applicantAddress: String,
        homeType: String,
        experience: String,
        message: String,
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("AdoptionPost", adoptionPostSchema);
