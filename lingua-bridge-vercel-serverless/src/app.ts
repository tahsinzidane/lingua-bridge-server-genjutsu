import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import translateRoutes from './routes/translateRoutes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || '*',
    credentials: true,
  })
);

app.use(express.json());

// Main API routes
app.use('/api', translateRoutes);

// Health check endpoints
app.get('/', (_req, res) => {
  res.json({ status: 'API is running' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'API is running' });
});

// NOTE: No app.listen() here — Vercel handles the server lifecycle.
export default app;
