import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    relatedPet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
    body: { type: String, required: true },
    readAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
