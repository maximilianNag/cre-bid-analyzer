const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'A test project',
        ownerId: '00000000-0000-0000-0000-000000000000',
        settings: {
          fuzzyMatchThreshold: 80,
          priceDeviationWarning: 5,
          priceDeviationError: 10,
        },
      },
    });
    console.log('Created project:', project);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 