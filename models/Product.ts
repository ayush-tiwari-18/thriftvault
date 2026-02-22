import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  storeName:{type: String},
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  size: String,
  condition: { 
    type: String, 
    enum: ['New with tags', 'Like new', 'Good', 'Fair'] 
  },
  category: { 
    type: String, 
    enum: ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories', 'Shoes'] 
  },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex'] },
  brand: String,
  images: [String],
  quantity: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);