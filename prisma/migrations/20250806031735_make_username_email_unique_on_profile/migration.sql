/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "author" ALTER COLUMN "slug" SET DEFAULT 'author';

-- AlterTable
ALTER TABLE "member" ALTER COLUMN "slug" SET DEFAULT 'member';

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_username_key" ON "profile"("username");
