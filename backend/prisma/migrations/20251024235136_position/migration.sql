/*
  Warnings:

  - Made the column `position` on table `cards` required. This step will fail if there are existing NULL values in that column.
  - Made the column `position` on table `columns` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cards" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "columnId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "priority" TEXT DEFAULT 'LOW',
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "cards_columnId_fkey" FOREIGN KEY ("columnId") REFERENCES "columns" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cards" ("columnId", "createdAt", "id", "position", "priority", "sessionId", "title", "updatedAt") SELECT "columnId", "createdAt", "id", "position", "priority", "sessionId", "title", "updatedAt" FROM "cards";
DROP TABLE "cards";
ALTER TABLE "new_cards" RENAME TO "cards";
CREATE INDEX "cards_columnId_position_idx" ON "cards"("columnId", "position");
CREATE INDEX "cards_priority_idx" ON "cards"("priority");
CREATE TABLE "new_columns" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sessionId" TEXT NOT NULL
);
INSERT INTO "new_columns" ("createdAt", "id", "position", "sessionId", "title", "updatedAt") SELECT "createdAt", "id", "position", "sessionId", "title", "updatedAt" FROM "columns";
DROP TABLE "columns";
ALTER TABLE "new_columns" RENAME TO "columns";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
