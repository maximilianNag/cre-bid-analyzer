import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import { ProjectService } from '../../services/db/project.service';
import { logger } from '../../utils/logger';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await this.projectService.findAll({
        _count: {
          select: {
            bids: true,
            categories: true,
          },
        },
      });

      res.json(projects);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const project = await this.projectService.findById(id, {
        _count: {
          select: {
            bids: true,
            categories: true,
          },
        },
      });

      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, ownerId, settings } = req.body;
      
      const project = await this.projectService.create({
        name,
        description,
        ownerId,
        settings,
      });

      logger.info(`Created new project: ${project.id}`);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, status, settings } = req.body;

      const project = await this.projectService.update(id, {
        name,
        description,
        status,
        settings,
        updatedAt: new Date(),
      });

      logger.info(`Updated project: ${id}`);
      res.json(project);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await this.projectService.delete(id);

      logger.info(`Deleted project: ${id}`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const analysis = await this.projectService.getProjectAnalysis(id);
      res.json(analysis);
    } catch (error) {
      next(error);
    }
  }

  async getBids(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bids = await this.projectService.getProjectBids(id);
      res.json(bids);
    } catch (error) {
      next(error);
    }
  }
} 