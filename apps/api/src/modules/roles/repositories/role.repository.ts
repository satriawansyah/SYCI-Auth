import type { Prisma } from '../../../generated/prisma/client';
import { database } from '../../../config/database';

type PrismaClient = Prisma.TransactionClient | typeof database.client;

export class RoleRepository {
  async findByName(name: string, tx?: PrismaClient) {
    const client = tx || database.client;
    return client.role.findUnique({
      where: {
        name,
      },
    });
  }
}
