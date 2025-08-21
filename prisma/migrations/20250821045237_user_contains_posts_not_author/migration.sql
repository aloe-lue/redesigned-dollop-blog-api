/*
  Warnings:

  - You are about to drop the column `authorId` on the `post` table. All the data in the column will be lost.

*/

-- Transaction
BEGIN;

-- update the post userId to the user id of which the author created the post
UPDATE "post"
SET "userId" = (
  SELECT DISTINCT "user"."id" FROM "user"
  JOIN "author" ON "user"."id" = "author"."userId"
  JOIN "post" ON "author"."authorId" = "author"."id"
);

COMMIT;

-- DropForeignKey
ALTER TABLE "public"."post" DROP CONSTRAINT "post_authorId_fkey";

-- AlterTable
ALTER TABLE "public"."post" DROP COLUMN "authorId";
