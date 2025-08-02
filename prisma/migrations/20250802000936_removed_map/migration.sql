/*
  Warnings:

  - You are about to drop the `oauth` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "oauth";

-- CreateTable
CREATE TABLE "OAuthToken" (
    "id" TEXT NOT NULL,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OAuthToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OAuthToken_googleId_key" ON "OAuthToken"("googleId");
