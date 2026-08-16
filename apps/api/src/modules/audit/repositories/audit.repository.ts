import { database } from '../../../config/database';
import type { AuditCreateInput } from '../types/audit-create.input';
import type { DatabaseClient } from '../../../shared/types/database-client.type';

export class AuditRepository {
  async create(data: AuditCreateInput, tx?: DatabaseClient) {
    const client = tx || database.client;
    return client.auditLog.create({
      data,
    });
  }
}
