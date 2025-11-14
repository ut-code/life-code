-- CreateTable
CREATE TABLE "CodeState" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codeData" TEXT NOT NULL,
    "codeName" TEXT NOT NULL,

    CONSTRAINT "CodeState_pkey" PRIMARY KEY ("id")
);
