import { database } from '../config/database';
import { PermissionName } from '../constants/permissions';
import { RoleName } from '../shared/enums/role-name.enum';

const roles = [
  { name: RoleName.ADMIN, description: 'System administrator' },
  { name: RoleName.USER, description: 'Default application user' },
  { name: RoleName.MODERATOR, description: 'Application moderator' },
];

const permissions = [
  { name: PermissionName.PROFILE_READ, description: 'Read own profile' },
  { name: PermissionName.USERS_READ, description: 'Read users' },
  { name: PermissionName.USERS_MANAGE, description: 'Manage users' },
  { name: PermissionName.ROLES_MANAGE, description: 'Manage roles and permissions' },
  { name: PermissionName.AUDIT_READ, description: 'Read audit logs' },
];

const rolePermissions: Record<RoleName, PermissionName[]> = {
  [RoleName.USER]: [PermissionName.PROFILE_READ],
  [RoleName.MODERATOR]: [
    PermissionName.PROFILE_READ,
    PermissionName.USERS_READ,
  ],
  [RoleName.ADMIN]: permissions.map((permission) => permission.name),
};

async function seed(): Promise<void> {
  const seededRoles = await Promise.all(
    roles.map((role) =>
      database.client.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: role,
      })
    )
  );

  const seededPermissions = await Promise.all(
    permissions.map((permission) =>
      database.client.permission.upsert({
        where: { name: permission.name },
        update: { description: permission.description },
        create: permission,
      })
    )
  );

  const roleIdByName = new Map(seededRoles.map((role) => [role.name, role.id]));
  const permissionIdByName = new Map(
    seededPermissions.map((permission) => [permission.name, permission.id])
  );

  await Promise.all(
    Object.entries(rolePermissions).flatMap(([roleName, permissionNames]) => {
      const roleId = roleIdByName.get(roleName);
      if (!roleId) {
        throw new Error(`Role ${roleName} was not seeded`);
      }

      return permissionNames.map((permissionName) => {
        const permissionId = permissionIdByName.get(permissionName);
        if (!permissionId) {
          throw new Error(`Permission ${permissionName} was not seeded`);
        }

        return database.client.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId } },
          update: {},
          create: { roleId, permissionId },
        });
      });
    })
  );

  console.log('Default roles and permissions seeded successfully.');
}

seed()
  .catch((error: unknown) => {
    console.error('Failed to seed default roles.', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.disconnect();
  });
