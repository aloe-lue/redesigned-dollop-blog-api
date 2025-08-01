-- AlterTable
ALTER TABLE "comment" ALTER COLUMN "dateUpdated" DROP NOT NULL;

-- AlterTable
ALTER TABLE "post" ALTER COLUMN "dateUpdated" DROP NOT NULL;

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "birthdate" TIMESTAMP NOT NULL DEFAULT '2020-12-09 16:09:53 +00:00',
ADD COLUMN     "username" VARCHAR(255);
