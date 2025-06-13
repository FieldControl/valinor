/*
  Warnings:

  - You are about to drop the column `content` on the `Card` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Card_columnId_position_key";

-- DropIndex
DROP INDEX "Column_boardId_position_key";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "content",
ALTER COLUMN "position" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Column" ALTER COLUMN "position" DROP DEFAULT;
