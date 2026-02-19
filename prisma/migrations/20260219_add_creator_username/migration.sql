-- Add username to CreatorProfile
ALTER TABLE "CreatorProfile" ADD COLUMN IF NOT EXISTS "username" TEXT NOT NULL DEFAULT 'creator';
CREATE UNIQUE INDEX IF NOT EXISTS "CreatorProfile_username_key" ON "CreatorProfile"("username");
