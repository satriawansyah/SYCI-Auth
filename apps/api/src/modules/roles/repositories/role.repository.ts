import { database } from "../../../config/database";

export class RoleRepository {

    async findByName(name: string) {
        return database.client.role.findUnique({
            where: {
                name
            }
        });
    }

}