import mongoose from 'mongoose';
import { seedInitialDatabase } from './seed.js';

// Disable query buffering so API routes never hang when MongoDB is waiting or offline
mongoose.set('bufferCommands', false);

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/omnipulse';

    // Check if placeholder password was left
    if (mongoUri.includes('<db_password>')) {
      console.warn('[OmniPulse MongoDB] Notice: MONGODB_URI contains "<db_password>". Please replace with your actual Atlas database password in server/.env.');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    console.log(`[OmniPulse MongoDB] Connected Successfully to: ${conn.connection.host}`);
    console.log(`[OmniPulse MongoDB] Target Database: ${conn.connection.name}`);

    // Seed initial collections if database is empty
    await seedInitialDatabase();
  } catch (error) {
    console.warn(`[OmniPulse MongoDB] Notice (${error.message}). Running with in-memory zero-downtime fallback.`);
  }
};
