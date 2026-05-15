import mongoose from "mongoose";

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    phone: String,
    status: { type: String, enum: ["new", "inReview", "resolved"], default: "new" }
  },
  { timestamps: true }
);

export default mongoose.model("ContactInquiry", contactInquirySchema);