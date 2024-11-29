-- CreateTable
CREATE TABLE "Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "deleted" BOOLEAN DEFAULT false,
    "id_column" INTEGER NOT NULL,
    CONSTRAINT "Task_id_column_fkey" FOREIGN KEY ("id_column") REFERENCES "Column" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Column" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "deleted" BOOLEAN DEFAULT false
);
INSERT INTO "new_Column" ("deleted", "description", "id") SELECT "deleted", "description", "id" FROM "Column";
DROP TABLE "Column";
ALTER TABLE "new_Column" RENAME TO "Column";
CREATE UNIQUE INDEX "Column_description_key" ON "Column"("description");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Task_description_key" ON "Task"("description");
