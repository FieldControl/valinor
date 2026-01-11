-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
