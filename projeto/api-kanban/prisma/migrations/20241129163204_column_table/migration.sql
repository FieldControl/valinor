-- CreateTable
CREATE TABLE "Column" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "deleted" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Column_description_key" ON "Column"("description");
