import mongoose, { Document, Schema } from 'mongoose';

export type Platform = 'amazon' | 'flipkart';

export interface IProduct extends Document {
  productId: string;
  platform: Platform;
  title: string;
  image: string;
  url: string;
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  lastScraped: Date;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    productId: { type: String, required: true },
    platform: { type: String, enum: ['amazon', 'flipkart'], required: true },
    title: { type: String, required: true },
    image: { type: String, default: '' },
    url: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    lowestPrice: { type: Number, required: true },
    highestPrice: { type: Number, required: true },
    lastScraped: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

productSchema.index({ productId: 1, platform: 1 }, { unique: true });

export default mongoose.model<IProduct>('Product', productSchema);
