import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Deixe esta função vazia se não quiser inicializar dados
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
