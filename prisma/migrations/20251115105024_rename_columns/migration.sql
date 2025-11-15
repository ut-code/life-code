/*
  Warnings:

  - You are about to drop the column `codeData` on the `Board` table. All the data in the column will be lost.
  - You are about to drop the column `data` on the `Board` table. All the data in the column will be lost.
  - Added the required column `board` to the `Board` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Board` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Board" DROP COLUMN "codeData",
DROP COLUMN "data",
ADD COLUMN     "board" JSONB NOT NULL,
ADD COLUMN     "code" JSONB NOT NULL;
