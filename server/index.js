import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load server/.env reliably regardless of working directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // Fallback to root .env if present

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import workoutRoutes from './routes/workoutRoutes.js';
import admobRoutes from './routes/admobRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Vite frontend (http://localhost:5173) and production hosts
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize MongoDB Connection & Seed Data
connectDB();

// API Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    version: '5.0.0',
    system: 'OmniPulse Backend Core',
    database: process.env.MONGODB_URI?.includes('<db_password>') ? 'WAITING_DB_PASSWORD' : 'CONFIGURED',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Route Mounts
app.use('/api/v1/workouts', workoutRoutes);
app.use('/api/v1/admob', admobRoutes);
app.use('/api/v1/rewards', rewardRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`[OmniPulse Server] Live on http://localhost:${PORT}`);
  console.log(`[OmniPulse Server] AI Chat Route: http://localhost:${PORT}/api/v1/ai/chat`);
  console.log(`[OmniPulse Server] AdMob SSV Route: http://localhost:${PORT}/api/v1/admob/ssv-callback`);
});

export default app;
