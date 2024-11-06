import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const column = await prisma.column.upsert({
    where: {
      name: 'best gym exercises',
    },
    update: {},
    create: {
      name: 'best gym exercises',
      Cards: {
        create: [
          {
            title: 'Incline dumbbell press',
            description: 'Best chest exercise',
          },
          {
            title: 'Squats',
            description: 'Best leg exercise',
          },
        ],
      },
    },
  });
  console.log({ column });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
