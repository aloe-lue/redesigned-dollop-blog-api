/*
  Warnings:

  - You are about to drop the column `authorId` on the `post` table. All the data in the column will be lost.

*/

-- DropForeignKey
ALTER TABLE "public"."post" DROP CONSTRAINT "post_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."post" DROP COLUMN "authorId";
