import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { validateProject } from '../validators/project.validator';

const router = Router();
const projectController = new ProjectController();

// Get all projects
router.get('/', projectController.getAll);

// Get a single project
router.get('/:id', projectController.getById);

// Create a new project
router.post('/', validateProject, projectController.create);

// Update a project
router.put('/:id', validateProject, projectController.update);

// Delete a project
router.delete('/:id', projectController.delete);

// Get project analysis
router.get('/:id/analysis', projectController.getAnalysis);

// Get project bids
router.get('/:id/bids', projectController.getBids);

export default router; 