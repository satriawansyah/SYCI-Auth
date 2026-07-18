import { database } from '../config/database';
import { RoleName } from '../shared/enums/role-name.enum';

async function grantRole(): Promise<void> {
  const [email, roleName] = process.argv.slice(2);
  if (!email || !roleName || !Object.values(RoleName).includes(roleName as RoleName)) {
    throw new Error('Usage: npm run db:grant-role -- <email> <ADMIN|USER|MODERATOR>');
  }

  const user = await database.client.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  const role = await database.client.role.findUnique({
    where: { name: roleName },
  });
  if (!role) {
    throw new Error('Role not found. Run db:seed first.');
  }

  await database.client.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });

  console.log(`Granted ${roleName} to ${email}.`);
}

grantRole()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.disconnect();
  });
