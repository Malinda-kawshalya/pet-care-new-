import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    serviceType: { type: String, enum: ["vet", "grooming", "training"], required: true },
    scheduledAt: { type: Date, required: true },
    status: { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
    notes: String,
    location: String
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
