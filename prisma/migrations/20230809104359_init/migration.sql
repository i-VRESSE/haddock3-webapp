-- CreateEnum
CREATE TYPE "ExpertiseLevel" AS ENUM ('guru', 'expert', 'easy');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "bartenderToken" TEXT NOT NULL DEFAULT '',
    "bartenderTokenExpiresAt" INTEGER NOT NULL DEFAULT 0,
    "expertiseLevels" "ExpertiseLevel"[] DEFAULT ARRAY[]::"ExpertiseLevel"[],
    "preferredExpertiseLevel" "ExpertiseLevel",
    "photo" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
