import type { Prisma } from '../../../generated/prisma/client';
import { database } from '../../../config/database';

type PrismaClient = Prisma.TransactionClient | typeof database.client;

export class AuthRepository {
  async findByEmail(email: string, tx?: PrismaClient) {
    const client = tx || database.client;
    return client.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string, tx?: PrismaClient) {
    const client = tx || database.client;
    return client.user.findUnique({
      where: { username },
    });
  }

  async create(data: Prisma.UserCreateInput, tx?: PrismaClient) {
    const client = tx || database.client;
    return client.user.create({
      data,
    });
  }

  async assignRole(userId: string, roleId: string, tx?: PrismaClient) {
    const client = tx || database.client;
    return client.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }
}
