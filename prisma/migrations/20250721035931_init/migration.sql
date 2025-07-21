-- CreateTable
CREATE TABLE "profile" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "middleName" VARCHAR(255),
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255),
    "bio" VARCHAR(255) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "picture" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "caption" VARCHAR(255),
    "profileId" TEXT,
    "createdDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "picture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "createdDate" DATE NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "author" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" VARCHAR(65535) NOT NULL,
    "dateCreated" TIMESTAMP NOT NULL,
    "dateUpdated" TIMESTAMP NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255),
    "content" VARCHAR(65535) NOT NULL,
    "dateCreated" TIMESTAMP NOT NULL,
    "dateUpdated" TIMESTAMP NOT NULL,
    "userId" TEXT,
    "postId" TEXT,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_id_key" ON "profile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "picture_id_key" ON "picture"("id");

-- CreateIndex
CREATE UNIQUE INDEX "member_id_key" ON "member"("id");

-- CreateIndex
CREATE UNIQUE INDEX "member_userId_key" ON "member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_id_key" ON "user"("id");

-- CreateIndex
CREATE UNIQUE INDEX "author_id_key" ON "author"("id");

-- CreateIndex
CREATE UNIQUE INDEX "author_userId_key" ON "author"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "post_id_key" ON "post"("id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_id_key" ON "comment"("id");

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "picture" ADD CONSTRAINT "picture_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "author" ADD CONSTRAINT "author_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_postId_fkey" FOREIGN KEY ("postId") REFERENCES "author"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
