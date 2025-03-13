import { ProjectService } from '../services/db/project.service';
import { logger } from '../utils/logger';

async function testProject() {
  const projectService = new ProjectService();

  try {
    // Create a new project
    const newProject = await projectService.create({
      name: 'Test Project',
      description: 'A test project to verify our setup',
      ownerId: '00000000-0000-0000-0000-000000000000', // Replace with a valid UUID
      settings: {
        fuzzyMatchThreshold: 80,
        priceDeviationWarning: 5,
        priceDeviationError: 10,
      },
    });

    logger.info('Created project:', newProject);

    // Retrieve the project
    const retrievedProject = await projectService.findById(newProject.id);
    logger.info('Retrieved project:', retrievedProject);

    // Update the project
    const updatedProject = await projectService.update(newProject.id, {
      description: 'Updated description',
    });
    logger.info('Updated project:', updatedProject);

  } catch (error) {
    logger.error('Error testing project:', error);
  }
}

testProject(); 