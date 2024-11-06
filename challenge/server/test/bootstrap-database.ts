import { PrismaClient } from '@prisma/client';
import { promisify } from 'node:util';
import { exec as execCb } from 'node:child_process';
import { ulid } from 'ulid';

const exec = promisify(execCb);

// IMPROVEMENT: re-write this when Prisma.io gets a programmatic migration API
// https://github.com/prisma/prisma/issues/4703
// https://github.com/prisma/prisma/issues/4703#issuecomment-1447354363
async function prismaMigrate(databaseUrl: string): Promise<void> {
  await exec('npx prisma migrate dev', {
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
  });
}

export const bootstrapDatabase = () => {
  const testId = 'test' + ulid();

  return {
    name: testId,
    setup: async () => {
      try {
        console.log(
          'bootstrapping database:',
          `${process.env.DATABASE_URL}/tests`,
        );
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: `${process.env.DATABASE_URL}/tests`,
            },
          },
        });

        await prisma.$connect();

        console.log('creating database:', testId);

        await prisma.$executeRawUnsafe(`CREATE DATABASE ${testId};`);

        await prisma.$disconnect();

        console.log(
          'migrating and seeding database:',
          `${process.env.DATABASE_URL}/${testId}`,
        );

        await prismaMigrate(`${process.env.DATABASE_URL}/${testId}`);

        console.log('database bootstrapped');
      } catch (error) {
        console.error('database bootstap failed: ', error);
        throw error;
      }
    },
    teardown: async () => {
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: `${process.env.DATABASE_URL}/tests`,
          },
        },
      });

      await prisma.$connect();

      console.log(
        'dropping database:',
        `${process.env.DATABASE_URL}/${testId}`,
      );

      await prisma.$executeRawUnsafe(`DROP DATABASE ${testId};`);

      await prisma.$disconnect();
    },
  };
};
