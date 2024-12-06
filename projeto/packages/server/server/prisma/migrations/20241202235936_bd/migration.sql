-- CreateTable
CREATE TABLE "Coluna" (
    "idColuna" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Card" (
    "idCard" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "idColuna" INTEGER NOT NULL,
    CONSTRAINT "Card_idColuna_fkey" FOREIGN KEY ("idColuna") REFERENCES "Coluna" ("idColuna") ON DELETE RESTRICT ON UPDATE CASCADE
);
