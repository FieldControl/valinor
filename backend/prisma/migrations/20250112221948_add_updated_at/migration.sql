/*
  Warnings:

  - You are about to drop the column `title` on the `Card` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Column` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_id_fkey";

-- AlterTable
ALTER TABLE "Board" ADD COLUMN "updatedAt" TIMESTAMP DEFAULT NOW();

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "title",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Column" ADD COLUMN "updatedAt" TIMESTAMP DEFAULT NOW();

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
