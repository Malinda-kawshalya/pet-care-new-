import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    veterinarian: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    provider: String,
    recordType: { type: String, enum: ["vaccination", "checkup", "treatment", "surgery", "other"], default: "checkup" },
    visitDate: { type: Date, default: Date.now },
    recordDate: { type: Date, default: Date.now },
    diagnosis: String,
    treatment: String,
    prescriptions: [String],
    documents: [String],
    notes: String,
    vetNotes: String,
    nextVisitDate: Date,
    healthAlerts: [String],
    status: { type: String, enum: ["active", "inactive", "archived"], default: "active" }
  },
  { timestamps: true }
);

export default mongoose.model("MedicalRecord", medicalRecordSchema);
