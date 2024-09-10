-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_columnId_fkey";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "columns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
