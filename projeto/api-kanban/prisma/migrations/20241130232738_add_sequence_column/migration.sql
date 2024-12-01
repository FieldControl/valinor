/*
  Warnings:

  - Added the required column `sequence` to the `Column` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Column" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "deleted" BOOLEAN DEFAULT false
);
INSERT INTO "new_Column" ("deleted", "description", "id") SELECT "deleted", "description", "id" FROM "Column";
DROP TABLE "Column";
ALTER TABLE "new_Column" RENAME TO "Column";
CREATE UNIQUE INDEX "Column_description_key" ON "Column"("description");
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    "id_column" INTEGER,
    CONSTRAINT "Task_id_column_fkey" FOREIGN KEY ("id_column") REFERENCES "Column" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("deleted", "description", "id", "id_column") SELECT "deleted", "description", "id", "id_column" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE UNIQUE INDEX "Task_description_key" ON "Task"("description");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
