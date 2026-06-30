import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { roleId: null },
    select: { id: true, role: true },
  });

  console.log(`Found ${users.length} users without roleId`);

  for (const user of users) {
    const role = await prisma.role.findUnique({
      where: { name: user.role },
    });
    
    if (role) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roleId: role.id },
      });
      console.log(`Updated user ${user.id} (${user.role}) -> roleId: ${role.id}`);
    } else {
      console.log(`Role not found for user ${user.id}: ${user.role}`);
    }
  }

  console.log('Done');
}
main();