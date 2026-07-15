import { database } from '../../../config/database';
import type { AuditCreateInput } from '../types/audit-create.input';

export class AuditRepository {
  async create(data: AuditCreateInput) {
    return database.client.auditLog.create({
      data,
    });
  }
}
