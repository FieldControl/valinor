/*
  Warnings:

  - Made the column `updatedAt` on table `Board` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Column` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Board" ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Column" ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);
