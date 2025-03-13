import { PrismaClient } from '@prisma/client';

export class BaseService {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
} 