import mongoose from "mongoose";

const groomerServiceSchema = new mongoose.Schema(
  {
    groomer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "Grooming" },
    price: { type: Number, default: 0 },
    durationMinutes: { type: Number, default: 60 },
    image: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("GroomerService", groomerServiceSchema);
