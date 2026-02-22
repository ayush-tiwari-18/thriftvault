import mongoose, { Schema, Document } from 'mongoose';

export const CartItemSchema = new Schema({
  product: { type: Object, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const CartSchema = new Schema({
  userId: { type: String, required: true, unique: true }, // Clerk userId
  storeId: { type: String, default: null },
  storeName: { type: String, default: '' },
  items: [CartItemSchema],
}, { timestamps: true });

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);