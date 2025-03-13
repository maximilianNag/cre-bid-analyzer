import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router } from './api/routes';
import { errorHandler } from './api/middlewares/errorHandler';
import { setupLogger } from './utils/logger';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = setupLogger();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  logger.info(`Server running at http://${HOST}:${PORT}/`);
}); 