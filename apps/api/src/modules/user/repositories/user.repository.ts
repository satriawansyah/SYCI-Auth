import { database } from '../../../config/database';

export class UserRepository {
  async findActiveUsers() {
    return database.client.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
