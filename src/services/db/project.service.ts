import { Project, Prisma } from '@prisma/client';
import { BaseService } from './base.service';
import { logger } from '../../utils/logger';

export class ProjectService extends BaseService {
  async findAll(include?: Prisma.ProjectInclude): Promise<Project[]> {
    try {
      return await this.prisma.project.findMany({ include });
    } catch (error) {
      logger.error('Error in ProjectService.findAll:', error);
      throw error;
    }
  }

  async findById(id: string, include?: Prisma.ProjectInclude): Promise<Project | null> {
    try {
      return await this.prisma.project.findUnique({
        where: { id },
        include,
      });
    } catch (error) {
      logger.error(`Error in ProjectService.findById for id ${id}:`, error);
      throw error;
    }
  }

  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    try {
      return await this.prisma.project.create({ data });
    } catch (error) {
      logger.error('Error in ProjectService.create:', error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    try {
      return await this.prisma.project.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error(`Error in ProjectService.update for id ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<Project> {
    try {
      return await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      logger.error(`Error in ProjectService.delete for id ${id}:`, error);
      throw error;
    }
  }

  async getProjectAnalysis(id: string) {
    try {
      return await this.prisma.analysis.findMany({
        where: { projectId: id },
        include: {
          category: true,
        },
      });
    } catch (error) {
      logger.error(`Error in ProjectService.getProjectAnalysis for id ${id}:`, error);
      throw error;
    }
  }

  async getProjectBids(id: string) {
    try {
      return await this.prisma.bid.findMany({
        where: { projectId: id },
        include: {
          contractor: true,
          _count: {
            select: {
              bidItems: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error(`Error in ProjectService.getProjectBids for id ${id}:`, error);
      throw error;
    }
  }
} 