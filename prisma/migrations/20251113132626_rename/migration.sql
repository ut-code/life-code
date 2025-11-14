/*
  Warnings:

  - You are about to drop the `BoardState` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "BoardState";

-- DropTable
DROP TABLE "CodeState";

-- CreateTable
CREATE TABLE "Board" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB NOT NULL,
    "name" TEXT NOT NULL,
    "preview" JSONB NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Code" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);
