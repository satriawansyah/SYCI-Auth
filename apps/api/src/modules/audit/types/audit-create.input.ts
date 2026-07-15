import type { AuditAction } from '../../../shared/enums/audit-action.enum';
import type { AuditEntity } from '../../../shared/enums/audit-entity.enum';

export interface AuditCreateInput {
  userId: string | null;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  ipAddress: string | null;
  userAgent: string | null;
}
