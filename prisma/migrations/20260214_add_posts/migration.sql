DO $$ BEGIN
  CREATE TYPE "PostType" AS ENUM ('VIDEO', 'IMAGE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AccessType" AS ENUM ('FREE', 'BASIC', 'PRO', 'PAID');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE "Post" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "type" "PostType" NOT NULL,
  "access" "AccessType" NOT NULL DEFAULT 'FREE',
  "price" INTEGER NOT NULL DEFAULT 0,
  "mediaUrl" TEXT NOT NULL,
  "duration" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");
