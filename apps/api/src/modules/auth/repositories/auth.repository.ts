import type { Prisma } from "../../../generated/prisma/client";
import { database } from "../../../config/database";

export class AuthRepository {

    async findByEmail(email: string) {
        return database.client.user.findUnique({
            where: { email }
        });
    }

    async findByUsername(username: string) {
        return database.client.user.findUnique({
            where: { username }
        });
    }

    async create(data: Prisma.UserCreateInput) {
        return database.client.user.create({
            data
        });
    }

    async assignRole(userId: string, roleId: string) {
        return database.client.userRole.create({
            data: {
                userId,
                roleId
            }
        });
    }
}