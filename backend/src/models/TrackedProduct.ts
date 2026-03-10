import mongoose, { Document, Schema } from 'mongoose';

export interface ITrackedProduct extends Document {
  userId: string;
  productId: mongoose.Types.ObjectId;
  alertPrice: number | null;
  alertEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const trackedProductSchema = new Schema<ITrackedProduct>(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    alertPrice: { type: Number, default: null },
    alertEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

trackedProductSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model<ITrackedProduct>('TrackedProduct', trackedProductSchema);
