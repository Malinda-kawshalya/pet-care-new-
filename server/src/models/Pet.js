import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    species: { type: String, enum: ["dog", "cat", "bird", "fish", "rabbit", "other"], default: "dog" },
    breed: String,
    age: Number,
    gender: { type: String, enum: ["male", "female", "unknown"], default: "unknown" },
    images: [String],
    vaccinationStatus: { type: String, enum: ["upToDate", "dueSoon", "overdue", "unknown"], default: "unknown" },
    medicalHistory: String,
    microchipId: String,
    location: {
      city: String,
      coordinates: { lat: Number, lng: Number }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Pet", petSchema);
