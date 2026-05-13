import mongoose from "mongoose";

const vaccinationSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    vaccineName: { type: String, required: true },
    administeredDate: Date,
    nextDueDate: { type: Date, required: true },
    status: { type: String, enum: ["scheduled", "completed", "overdue"], default: "scheduled" },
    reminderSent: { type: Boolean, default: false },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Vaccination", vaccinationSchema);
