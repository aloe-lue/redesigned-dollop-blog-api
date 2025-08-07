/*
  Warnings:

  - You are about to drop the column `email` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `profile` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `user` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "profile_email_key";

-- DropIndex
DROP INDEX "profile_username_key";

-- AlterTable
ALTER TABLE "profile" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "username";

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "password" VARCHAR(255) NOT NULL,
ADD COLUMN     "username" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");
