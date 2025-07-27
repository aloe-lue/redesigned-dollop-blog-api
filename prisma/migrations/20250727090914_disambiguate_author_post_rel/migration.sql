/*
  Warnings:

  - You are about to drop the column `postId` on the `post` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_postId_fkey";

-- AlterTable
ALTER TABLE "post" DROP COLUMN "postId",
ADD COLUMN     "authorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
