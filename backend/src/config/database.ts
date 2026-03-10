import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pricetrack';

  try {
    await mongoose.connect(uri);
    console.log('[Database] Connected to MongoDB');
  } catch (error) {
    console.error('[Database] Connection error:', error);
    throw error;
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] Disconnected from MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB error:', err);
});
