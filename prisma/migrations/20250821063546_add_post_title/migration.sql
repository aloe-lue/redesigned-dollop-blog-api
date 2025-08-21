/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."post" ADD COLUMN     "title" VARCHAR(255) NOT NULL DEFAULT 'the title of the post';

-- CreateIndex
CREATE UNIQUE INDEX "post_title_key" ON "public"."post"("title");
