import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shippingName: { type: String, trim: true },
    shippingEmail: { type: String, trim: true },
    shippingPhone: { type: String, trim: true },
    shippingAddress: String,
    paymentMethod: { type: String, enum: ["card", "paypal", "wallet", "cod"], default: "card" },
    paymentLast4: { type: String, trim: true },
    estimatedDeliveryAt: Date,
    trackingNumber: String,
    trackingHistory: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1 },
        price: Number
      }
    ],
    total: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    orderStatus: { type: String, enum: ["placed", "processing", "shipped", "delivered", "cancelled", "rejected"], default: "placed" },
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
