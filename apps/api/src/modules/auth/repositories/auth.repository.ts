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
    return client.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
  }

  async removeRole(userId: string, roleId: string, tx?: DatabaseClient) {
    const client = tx || database.client;
    return client.userRole.deleteMany({ where: { userId, roleId } });
  }

  async createSession(
    data: { userId: string; refreshToken: string; expiresAt: Date },
    tx?: DatabaseClient
  ) {
    const client = tx || database.client;
    return client.session.create({ data });
  }

  async updateSessionRefreshToken(
    sessionId: string,
    refreshToken: string,
    tx?: DatabaseClient
  ) {
    const client = tx || database.client;
    return client.session.update({
      where: { id: sessionId },
      data: { refreshToken, lastUsedAt: new Date() },
    });
  }

  async findSessionById(sessionId: string) {
    return database.client.session.findUnique({
      where: { id: sessionId },
    });
  }

  async revokeSession(sessionId: string) {
    return database.client.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
  }

  async findUserById(userId: string) {
    return database.client.user.findUnique({
      where: { id: userId },
    });
  }

  async findAuthorization(userId: string) {
    const assignments = await database.client.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    return {
      roles: assignments.map((assignment) => assignment.role.name),
      permissions: [
        ...new Set(
          assignments.flatMap((assignment) =>
            assignment.role.permissions.map((rolePermission) =>
              rolePermission.permission.name
            )
          )
        ),
      ],
    };
  }

  async recordSuccessfulLogin(userId: string, tx?: DatabaseClient) {
    const client = tx || database.client;
    return client.user.update({
      where: { id: userId },
      data: {
        loginCount: { increment: 1 },
        lastLoginAt: new Date(),
      },
    });
  }
}
