import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();

  const board = await prisma.board.create({
    data: {
      title: 'Meu Primeiro Quadro Kanban',
    },
  });

  console.log(`Board criado: ${board.title} (ID: ${board.id})`);

  const columnToDo = await prisma.column.create({
    data: {
      title: 'To Do',
      position: 0,
      boardId: board.id,
    },
  });

  const columnDoing = await prisma.column.create({
    data: {
      title: 'Doing',
      position: 1,
      boardId: board.id,
    },
  });

  const columnDone = await prisma.column.create({
    data: {
      title: 'Done',
      position: 2,
      boardId: board.id,
    },
  });

  console.log(`Colunas criadas para o Board ${board.id}: To Do, Doing, Done`);

  await prisma.card.create({
    data: {
      title: 'Aprender Next.js',
      position: 0,
      columnId: columnToDo.id,
    },
  });

  await prisma.card.create({
    data: {
      title: 'Configurar Prisma',
      position: 0,
      columnId: columnDoing.id,
    },
  });

  await prisma.card.create({
    data: {
      title: 'Resolver erro de persistência', 
      position: 1,
      columnId: columnDoing.id,
    },
  });

  await prisma.card.create({
    data: {
      title: 'Estudar Banco de Dados',
      position: 0,
      columnId: columnDone.id,
    },
  });

  console.log('Cards iniciais criados.');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });