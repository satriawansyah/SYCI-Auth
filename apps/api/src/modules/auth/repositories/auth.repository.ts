import type { Prisma } from '../../../generated/prisma/client';
import { database } from '../../../config/database';
import type { DatabaseClient } from '../../../shared/types/database-client.type';

export class AuthRepository {
  async findByEmail(email: string, tx?: DatabaseClient) {
    const client = tx || database.client;
    return client.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string, tx?: DatabaseClient) {
    const client = tx || database.client;
    return client.user.findUnique({
      where: { username },
    });
  }

  // TODO: Replace Prisma.UserCreateInput with internal CreateUserInput DTO
  // to fully decouple the Service layer from Prisma types (Sprint 2).
  async create(data: Prisma.UserCreateInput, tx?: DatabaseClient) {
    const client = tx || database.client;
    return client.user.create({
      data,
    });
  }

  async assignRole(userId: string, roleId: string, tx?: DatabaseClient) {
    const client = tx || database.client;
    return client.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }
}
