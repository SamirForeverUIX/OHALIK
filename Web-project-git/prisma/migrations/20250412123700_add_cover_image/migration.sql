/*
  Warnings:

  - Added the required column `coverImage` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "coverImage" TEXT NOT NULL;
