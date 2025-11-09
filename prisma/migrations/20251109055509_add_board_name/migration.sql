-- CreateTable
CREATE TABLE "BoardState" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "boardData" JSONB NOT NULL,
    "boardName" TEXT NOT NULL,

    CONSTRAINT "BoardState_pkey" PRIMARY KEY ("id")
);
