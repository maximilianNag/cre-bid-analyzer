import { Router } from 'express';
import projectRoutes from './project.routes';
import contractorRoutes from './contractor.routes';
import bidRoutes from './bid.routes';
import analysisRoutes from './analysis.routes';

export const router = Router();

router.use('/projects', projectRoutes);
router.use('/contractors', contractorRoutes);
router.use('/bids', bidRoutes);
router.use('/analysis', analysisRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
}); 