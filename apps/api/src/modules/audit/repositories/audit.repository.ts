import type { Prisma } from "../../../generated/prisma/client";
import { database } from "../../../config/database";

export class AuditRepository {
  async createLog(data: Prisma.AuditLogCreateInput) {
    return database.client.auditLog.create({
      data,
    });
  }
}
