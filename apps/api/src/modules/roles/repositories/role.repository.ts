import { database } from '../../../config/database';
import type { DatabaseClient } from '../../../shared/types/database-client.type';
import type { RoleName } from '../../../shared/enums/role-name.enum';

export class RoleRepository {
  async findByName(name: RoleName, tx?: DatabaseClient) {
    const client = tx || database.client;
    return client.role.findUnique({
      where: {
        name,
      },
    });
  }
}
