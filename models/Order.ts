import mongoose, { Schema, Document } from "mongoose";
import { CartItemSchema } from "./Cart";

const OrderSchema = new Schema(
  {
    userId: { type: String, required: true }, // Clerk userId
    storeId: { type: String, default: null },
    storeName: { type: String, default: "" },
    items: [CartItemSchema],
    customerName: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    shippingAddress: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    paymentIntentId: { type: String, default: "" },
    status: { type: String, default: "pending" },
  },
  { timestamps: true },
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
