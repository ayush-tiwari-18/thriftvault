import mongoose, { Schema } from 'mongoose';

const StoreSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  location: String,
  bannerImage: String,
  logoImage: String,
  activeItems: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Store || mongoose.model('Store', StoreSchema);