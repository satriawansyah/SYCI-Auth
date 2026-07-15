import type { Prisma } from '../../../generated/prisma/client';
import { database } from '../../../config/database';
import type { AuditCreateInput } from '../types/audit-create.input';

type PrismaClient = Prisma.TransactionClient | typeof database.client;

export class AuditRepository {
  async create(data: AuditCreateInput, tx?: PrismaClient) {
    const client = tx || database.client;
    return client.auditLog.create({
      data,
    });
  }
}
