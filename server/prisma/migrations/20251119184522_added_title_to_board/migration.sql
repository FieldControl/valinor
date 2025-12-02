/*
  Warnings:

  - Added the required column `title` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Board" ADD COLUMN     "title" TEXT NOT NULL;
