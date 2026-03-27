import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors'
import translateRoutes from './routes/translateRoutes.js';
import * as dotenv from 'dotenv';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin:"process.env.FRONTEND_ORIGIN",
  credentials: true,
}));
app.use(express.json());

// Main API routes
app.use('/api', translateRoutes);

// Health check endpoint
const healthCheck = (req: Request, res: Response) => {
  res.json({ status: 'API is running' });
};

app.get('/', healthCheck);
app.get('/health', healthCheck);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;