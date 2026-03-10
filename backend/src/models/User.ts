import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  uid: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
