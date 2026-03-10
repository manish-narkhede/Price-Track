import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceHistory extends Document {
  productId: mongoose.Types.ObjectId;
  price: number;
  timestamp: Date;
}

const priceHistorySchema = new Schema<IPriceHistory>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  price: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true },
});

priceHistorySchema.index({ productId: 1, timestamp: -1 });

export default mongoose.model<IPriceHistory>('PriceHistory', priceHistorySchema);
