-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_columnId_fkey";

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "Column"("id") ON DELETE CASCADE ON UPDATE CASCADE;
