import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const rolesToUpdate = [
    'OPERADOR_CENTRO',
    'COORDINADOR_FISICA',
    'COORDINADOR_ELECTRONICA',
    'GERENTE_SEGURIDAD',
  ];

  for (const roleName of rolesToUpdate) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (role) {
      const perms = role.permissions as Record<string, boolean>;
      if (!perms.electronic_security) {
        perms.electronic_security = true;
        await prisma.role.update({
          where: { name: roleName },
          data: { permissions: perms },
        });
        console.log(`Added electronic_security to ${roleName}`);
      } else {
        console.log(`${roleName} already has electronic_security`);
      }
    }
  }

  console.log('Done');
}
main();