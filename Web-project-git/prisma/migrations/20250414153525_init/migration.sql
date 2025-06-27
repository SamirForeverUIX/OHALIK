/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Blog` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_authorId_fkey";

-- AlterTable
ALTER TABLE "Blog" DROP COLUMN "createdAt",
ADD COLUMN     "authorId" INTEGER,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedAt";

-- DropTable
DROP TABLE "BlogPost";
