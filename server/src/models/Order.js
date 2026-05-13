import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1 },
        price: Number
      }
    ],
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    orderStatus: { type: String, enum: ["placed", "processing", "shipped", "delivered", "cancelled"], default: "placed" },
    trackingNumber: String,
    shippingAddress: String
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
