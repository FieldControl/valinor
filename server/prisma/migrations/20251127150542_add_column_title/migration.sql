/*
  Warnings:

  - Added the required column `title` to the `Column` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Column" ADD COLUMN     "title" TEXT NOT NULL;
