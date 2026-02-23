// models/ApprovedVendor.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IApprovedVendor extends Document {
  email: string;
  isApproved: boolean;
  storeId?: mongoose.Types.ObjectId; // Links to the Store once they complete onboarding
  clerkUserId?: string; // Links to their Clerk account after first login
  addedAt: Date;
}

const ApprovedVendorSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  isApproved: { 
    type: Boolean, 
    default: true 
  },
  // We keep these optional initially; they get filled when the merchant signs up
  storeId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Store' 
  },
  clerkUserId: { 
    type: String 
  },
  addedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.ApprovedVendor || 
       mongoose.model<IApprovedVendor>('ApprovedVendor', ApprovedVendorSchema);