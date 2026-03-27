import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is not defined in environment variables');
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('🔄 Connecting to MongoDB...');

    cached.promise = mongoose.connect(MONGODB_URI as string, {
      dbName: 'aayam_omr',
      serverSelectionTimeoutMS: 15000, // ⏱ wait max 15 sec
      socketTimeoutMS: 45000,
    })
    .then((mongooseInstance) => {
      console.log('✅ MongoDB connected:', mongooseInstance.connection.host);
      return mongooseInstance;
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error FULL:', error);

      // 🔥 important: reset promise so retry works
      cached.promise = null;

      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    console.error('❌ MongoDB final connection error:', error);
    throw error;
  }

  return cached.conn;
}