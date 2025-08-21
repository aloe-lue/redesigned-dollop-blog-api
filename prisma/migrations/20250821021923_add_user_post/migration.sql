-- AlterTable
ALTER TABLE "public"."post" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
