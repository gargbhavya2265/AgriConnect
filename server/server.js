import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import cropRoutes from './routes/crop.routes.js';
import healthRoutes from './routes/health.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import diseaseRoutes from './routes/disease.routes.js';
import marketplaceRoutes from './routes/marketplace.routes.js';
import schemeRoutes from './routes/scheme.routes.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';

const app = express();
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static('uploads'));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommend-crop', recommendationRoutes);
app.use('/api/detect-disease', diseaseRoutes);
app.use('/api', marketplaceRoutes);
app.use('/api/schemes', schemeRoutes);
app.get('/api', (_, res) => res.json({ name: 'AgriConnect API', version: '1.0.0' }));
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agriconnect')
    .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
    .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
}
export default app;
