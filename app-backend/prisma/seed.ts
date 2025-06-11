// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const emailAdmin = 'admin@exemplo.com';
  const senhaAdmin = 'senha123';

  const hashed = await bcrypt.hash(senhaAdmin, 10);

  await prisma.user.upsert({
    where: { email: emailAdmin },
    update: {}, // se já existir, não faz nada
    create: {
      name: 'admin',
      email: emailAdmin,
      password: hashed,
      tipo: 0, // 0 = admin
    },
  });

  console.log('✅ Seed de admin concluída');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
