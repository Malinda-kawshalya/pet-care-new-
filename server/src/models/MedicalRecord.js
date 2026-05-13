import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    veterinarian: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    visitDate: { type: Date, default: Date.now },
    diagnosis: String,
    treatment: String,
    prescriptions: [String],
    documents: [String],
    vetNotes: String,
    nextVisitDate: Date,
    healthAlerts: [String]
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);
